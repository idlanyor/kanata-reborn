import './src/global.js'
import { createServer } from 'node:http'
import express from 'express'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import { Kanata, clearMessages } from './src/helper/bot.js';
import { groupParticipants, groupUpdate } from './src/lib/group.js';
import { checkAnswer, tebakSession } from './src/lib/tebak/index.js';
import { getMedia } from './src/helper/mediaMsg.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { call } from './src/lib/call.js';
import { logger } from './src/helper/logger.js';
import { gpt4Hika } from './src/lib/ai.js';
import { schedulePrayerReminders } from './src/lib/jadwalshalat.js';
import User from './src/database/models/User.js';
import Group from './src/database/models/Group.js';
import { addMessageHandler } from './src/helper/message.js'
import { autoAI } from './src/lib/autoai.js'
import GeminiHandler from './src/lib/geminiHandler.js';

const app = express()
const server = createServer(app)
globalThis.io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
})

const _dirname = dirname(fileURLToPath(import.meta.url))
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tambahkan middleware untuk handle JSON dan static files
app.use(express.json())
app.use(express.static(join(_dirname, 'public')))

// Fungsi untuk mencari semua file .js secara rekursif
function findJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Jika itu folder, lakukan rekursi
        if (stat && stat.isDirectory()) {
            results = results.concat(findJsFiles(filePath));
        }
        // Jika itu file .js, tambahkan ke results
        else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

app.get('/', (req, res) => {
    res.sendFile(join(_dirname, 'index.html'))
})

// Inisialisasi Gemini Handler
const geminiHandler = new GeminiHandler(globalThis.apiKey.gemini);

async function getPhoneNumber() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const namaSesiPath = path.join(__dirname, globalThis.sessionName);

    try {
        await fs.promises.access(namaSesiPath);
        rl.close();
    } catch {
        return new Promise(resolve => {
            const validatePhoneNumber = (input) => {
                const phoneRegex = /^62\d{9,15}$/;
                return phoneRegex.test(input);
            };
            const askForPhoneNumber = () => {
                logger.showBanner();
                rl.question(chalk.yellowBright("Enter phone number (with country code, e.g., 628xxxxx): "), input => {
                    if (validatePhoneNumber(input)) {
                        logger.success("Valid phone number entered!");
                        rl.close();
                        resolve(input);
                    } else {
                        logger.error("Invalid phone number! Must start with '62' and contain only numbers (minimum 10 digits).");
                        askForPhoneNumber();
                    }
                });
            };
            askForPhoneNumber();
        });
    }
}

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
    if (!command && !attf) return;
    if (m.key.fromMe) return;

    try {
        // =================================
        // SISTEM PEMROSESAN PESAN
        // =================================
        // 1. Private Chat: Menggunakan Gemini AI untuk analisis natural language & gambar
        //    - Mencoba mengenali command dari bahasa natural
        //    - Menganalisis gambar jika ada
        //    - Chat biasa jika tidak ada command yang cocok
        // 2. Group Chat: Hanya mengenali command dengan prefix (! atau .)
        //    - AutoAI hanya aktif jika diaktifkan di pengaturan grup
        // =================================

        // Cek apakah chat private atau grup
        const isPrivateChat = !id.endsWith('@g.us');

        // Cek apakah ada gambar yang dikirim/direply
        const hasImage = Buffer.isBuffer(attf);

        // Gunakan Gemini AI hanya untuk private chat
        if (isPrivateChat) {
            // Jika ada gambar, proses dengan Gemini Vision
            if (hasImage) {
                logger.info(`Processing image in private chat from ${m.pushName}`);
                const imageResponse = await geminiHandler.analyzeImage(attf, command, { id, m });

                if (imageResponse.success) {
                    await sock.sendMessage(id, {
                        text: imageResponse.message
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(id, {
                        text: imageResponse.message
                    }, { quoted: m });
                }
                return;
            }

            // Jika tidak ada gambar, proses teks seperti biasa
            if (command && command.length >= 3 && sender !== globalThis.botNumber) {
                logger.info(`Processing private chat message with Gemini AI: ${command.substring(0, 30)}...`);
                try {
                    const response = await geminiHandler.analyzeMessage(command);

                    // Jika berhasil diproses oleh Gemini
                    if (response.success) {
                        // Eksekusi command yang diidentifikasi oleh Gemini
                        const cmd = response.command;
                        const args = response.args;

                        const pluginsDir = path.join(__dirname, 'src/plugins');
                        const plugins = Object.fromEntries(
                            await Promise.all(findJsFiles(pluginsDir).map(async file => {
                                const { default: plugin, handler } = await import(pathToFileURL(file).href);
                                if (Array.isArray(handler) && handler.includes(cmd)) {
                                    return [cmd, plugin];
                                }
                                return [handler, plugin];
                            }))
                        );

                        if (plugins[cmd]) {
                            logger.info(`Executing command from Gemini: ${cmd}`);
                            await sock.sendMessage(id, { text: response.message });
                            await plugins[cmd]({ sock, m, id, psn: args, sender, noTel, attf, cmd });
                            logger.success(`Command ${cmd} executed successfully`);
                        } else {
                            await sock.sendMessage(id, { text: response.message });
                        }
                        return;
                    }

                    // Jika tidak berhasil, coba chat biasa (hanya untuk private chat)
                    if (!command.startsWith('!') && !command.startsWith('.')) {
                        const chatResponse = await geminiHandler.chat(command);
                        await sock.sendMessage(id, { text: chatResponse });
                        return;
                    }
                } catch (geminiError) {
                    logger.error('Error in Gemini processing:', geminiError);
                    // Jika error di Gemini, lanjutkan ke command biasa
                }
            }
        }

        // Untuk grup, cek apakah ada command dengan handler yang cocok dengan gptgambar
        if (hasImage && !isPrivateChat) {
            const imageHandlers = ['jelasin', 'tulis', 'kanata', 'bacakan', 'bacain',
                'kerjain', 'kerjakan', 'jelaskan', 'terjemahkan',
                'mangsud', 'maksud'];

            const cmdLower = command ? command.toLowerCase() : '';

            // Cek apakah command dimulai dengan salah satu handler
            const matchHandler = imageHandlers.some(handler =>
                cmdLower.startsWith(`!${handler}`) ||
                cmdLower.startsWith(`.${handler}`) ||
                cmdLower === handler
            );

            if (matchHandler) {
                logger.info(`Processing image in group with command: ${command}`);
                const imageResponse = await geminiHandler.analyzeImage(attf, command, { id, m });

                if (imageResponse.success) {
                    await sock.sendMessage(id, {
                        text: imageResponse.message
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(id, {
                        text: imageResponse.message
                    }, { quoted: m });
                }
                return;
            }
        }

        // Proses sebagai command biasa (untuk grup atau jika Gemini gagal di private chat)
        // Periksa apakah command ada dan bukan array
        let cmd = '', args = [];
        if (command && typeof command === 'string') {
            [cmd, ...args] = command.split(' ');
        }
        cmd = cmd.toLowerCase();
        if (command.startsWith('!')) {
            cmd = command.toLowerCase().substring(1).split(' ')[0];
            args = command.split(' ').slice(1)
        }
        if (command.startsWith('.')) {
            cmd = command.toLowerCase().substring(1).split(' ')[0];
            args = command.split(' ').slice(1)
        }
        // logger.info(`Pesan baru diterima dari ${m.pushName}`);
        // logger.message.in(command);

        // Inisialisasi pengaturan grup jika pesan dari grup
        if (id.endsWith('@g.us')) {
            await Group.initGroup(id);
            const settings = await Group.getSettings(id);

            // Cek spam
            if (settings.antispam) {
                const spamCheck = await Group.checkSpam(noTel, id);
                if (spamCheck.isSpam) {
                    await Group.incrementWarning(noTel, id);
                    if (spamCheck.warningCount >= 3) {
                        await sock.groupParticipantsUpdate(id, [noTel], 'remove');
                        await sock.sendMessage(id, {
                            text: `@${noTel.split('@')[0]} telah dikeluarkan karena spam`,
                            mentions: [noTel]
                        });
                        return;
                    }
                    await sock.sendMessage(id, {
                        text: `⚠️ @${noTel.split('@')[0]} Warning ke-${spamCheck.warningCount + 1} untuk spam!`,
                        mentions: [noTel]
                    });
                    return;
                }
            }

            // Cek antipromosi
            if (settings.antipromosi) {
                try {
                    const { default: antipromosi } = await import('./src/plugins/hidden/events/antipromosi.js');
                    await antipromosi({
                        sock,
                        m,
                        id,
                        psn: m.body,
                        sender: noTel + '@s.whatsapp.net'
                    });
                    // return; // Hentikan proses jika promosi terdeteksi
                } catch (error) {
                    logger.error('Error in antipromosi:', error);
                }
            }

            // Cek antilink
            if (settings.antilink) {
                try {
                    const { default: antilink } = await import('./src/plugins/hidden/events/antilink.js');
                    await antilink({
                        sock,
                        m,
                        id,
                        psn: m.body,
                        sender: noTel + '@s.whatsapp.net'
                    });
                    // return; // Hentikan proses jika link terdeteksi
                } catch (error) {
                    logger.error('Error in antilink:', error);
                }
            }

            // Cek antitoxic
            if (settings.antitoxic) {
                try {
                    const { default: antitoxic } = await import('./src/plugins/hidden/events/antitoxic.js');
                    await antitoxic({
                        sock,
                        m,
                        id,
                        psn: m.body,
                        sender: noTel + '@s.whatsapp.net'
                    });
                    // return; // Hentikan proses jika toxic terdeteksi
                } catch (error) {
                    logger.error('Error in antitoxic:', error);
                }
            }

            // Cek only admin
            if (settings.only_admin) {
                const groupAdmins = await getGroupAdmins({ sock, id });
                if (!groupAdmins.includes(noTel)) {
                    return;
                }
            }
        } else {
            // if (m.key.fromMe) return;
        }

        // Cek dan buat user jika belum ada (untuk grup dan pribadi)
        let user = await User.getUser(noTel);
        if (!user) {
            await User.create(noTel, m.pushName || 'User');
        }

        // Tambah exp untuk setiap pesan (5-15 exp random)
        const expGained = Math.floor(Math.random() * 11) + 5;
        const expResult = await User.addExp(noTel, expGained);

        // Jika naik level, kirim notifikasi
        // if (expResult.levelUp) {
        //     await sock.sendMessage(id, {
        //         text: `🎉 Selamat! Level kamu naik ke level ${expResult.newLevel}!`
        //     }, { quoted: m });
        // }

        // Jika ada command, increment counter command
        if (command.startsWith('!') || command.startsWith('.')) {
            await User.incrementCommand(noTel);
        }

        const pluginsDir = path.join(__dirname, 'src/plugins');
        const plugins = Object.fromEntries(
            await Promise.all(findJsFiles(pluginsDir).map(async file => {
                const { default: plugin, handler } = await import(pathToFileURL(file).href);
                if (Array.isArray(handler) && handler.includes(cmd)) {
                    return [cmd, plugin];
                }
                return [handler, plugin];
            }))
        );

        if (plugins[cmd]) {
            logger.info(`Executing command: ${cmd}`);
            await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf, cmd });
            logger.success(`Command ${cmd} executed successfully`);
        }

    } catch (error) {
        logger.error('Error in message processing:', error);
        await sock.sendMessage(id, {
            text: "Waduh error nih bestie! Coba lagi ntar ya 🙏"
        });
    }
}
export async function startBot() {
    const phoneNumber = await getPhoneNumber();
    const bot = new Kanata({
        phoneNumber,
        sessionId: globalThis.sessionName,
        pairingCode: true // Tambahkan opsi ini untuk mengaktifkan pairing code
    });

    bot.start().then(sock => {
        logger.success('Bot started successfully!');
        logger.divider();
        // sock.ev.removeAllListeners('messages.upsert');
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                let m = chatUpdate.messages[0];
                m = addMessageHandler(m, sock);
                if (m.key.fromMe) return
                // Deteksi media dengan fungsi yang sudah diperbaiki
               
                const sender = m.pushName;
                const id = m.chat;
                // if(id.endsWith('@g.us')) return
                const noTel = (id.endsWith('@g.us')) ? m.sender.split('@')[0].replace(/[^0-9]/g, '') : m.chat.split('@')[0].replace(/[^0-9]/g, '');
                // console.log()
                const mediaType = {
                    image: {
                        buffer: m.message?.imageMessage || m.quoted?.message?.imageMessage,
                        caption: m.message?.imageMessage?.caption || m.message?.extendedTextMessage?.text,
                        mime: m.message?.imageMessage?.mimetype || m.quoted?.message.imageMessage?.mimetype,
                    },
                    video: {
                        buffer: m.message?.videoMessage || m.quoted?.videoMessage,
                        caption: m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text,
                        mime: m.message?.videoMessage?.mimetype || m.quoted?.message?.videoMessage?.mimetype,
                    },
                    audio: {
                        buffer: m.message?.audioMessage || m.quoted?.message?.audioMessage,
                        caption: m.message?.audioMessage?.caption || m.message?.extendedTextMessage?.text,
                        mime: m.message?.audioMessage?.mimetype || m.quoted?.message?.audioMessage?.mimetype,
                    }
                }
                if (mediaType.image.buffer || mediaType.audio.buffer) {
                    // Cek tipe media secara spesifik
                    if (isAudioMessage(m)) {
                        logger.info(`Detected audio/voice note from ${m.sender}`);
                        await handleAudioMessage(m);
                        return;
                    }

                    if (isImageMessage(m)) {
                        logger.info(`Detected image from ${m.sender}`);
                        await handleImageMessage(m);
                        return;
                    }

                    // Untuk tipe media lain yang belum ditangani khusus
                    logger.info(`Detected other media type from ${m.sender}`);
                    await m.reply('Media jenis ini belum didukung. Coba kirim gambar atau voice note ya! 🙏');
                    return;
                }
                // console.log(mediaType.image.buffer)
                if (mediaType.image.buffer) {
                    const imageBuffer = await getMedia({ message: { imageMessage: mediaType.image.buffer } });
                    await prosesPerintah({ command: mediaType.image.caption, sock, m, id, sender, noTel, attf: imageBuffer, mime: mediaType.image.mime });
                    return;
                }
                if (mediaType.video.buffer) {
                    const videoBuffer = await getMedia({ message: { videoMessage: mediaType.video.buffer } });
                    await prosesPerintah({ command: mediaType.video.caption, sock, m, id, sender, noTel, attf: videoBuffer, mime: mediaType.video.mime });
                    return;
                }
                if (mediaType.audio.buffer) {
                    const audioBuffer = await getMedia({ message: { audioMessage: mediaType.audio.buffer } });
                    await prosesPerintah({ command: mediaType.audio.caption, sock, m, id, sender, noTel, attf: audioBuffer, mime: mediaType.audio.mime });
                    return;
                }


                if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                    const cmd = JSON.parse(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
                    await prosesPerintah({ command: `!${cmd.id}`, sock, m, id, sender, noTel, attf: null, mime: null });
                }
                if (m.message?.templateButtonReplyMessage) {
                    const cmd = m.message?.templateButtonReplyMessage?.selectedId;
                    await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel, attf: null, mime: null });
                }
                if (m.message?.buttonsResponseMessage) {
                    const cmd = m.message?.buttonsResponseMessage?.selectedButtonId;
                    await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel, attf: null, mime: null });
                }
                let botId = sock.user.id.replace(/:\d+/, '')
                let botMentioned = m.message?.extendedTextMessage?.contextInfo?.participant?.includes(botId)
                    || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botId)
                let fullmessage = m.body
                // console.log(m.body)
                let ctx = m.quoted?.text || ''

                // Auto AI mention - hanya aktif di private chat atau jika diaktifkan di grup
                if (botMentioned) {
                    if (m.key.fromMe) return
                    try {
                        // Strategi AutoAI:
                        // 1. Private chat: Selalu aktif
                        // 2. Group chat: Aktif hanya jika setting autoai = 1

                        // Identifikasi tipe chat
                        const isPrivateChat = !id.endsWith('@g.us');

                        // Di private chat, selalu aktifkan AutoAI
                        if (isPrivateChat) {
                            logger.info(`AutoAI activated in private chat with ${m.pushName || noTel}`);
                            const userId = `private_${noTel}`;
                            const quotedText = m.quoted?.text || "";

                            // Log untuk debugging
                            logger.info(`Calling chatWithMemory for user ${userId}`);
                            logger.info(`Message: ${fullmessage.substring(0, 30)}...`);
                            logger.info(`Context: pushName=${m.pushName}, noTel=${noTel}, quotedText=${quotedText ? 'present' : 'none'}`);

                            try {
                                const response = await geminiHandler.chatWithMemory(
                                    fullmessage,
                                    userId,
                                    {
                                        pushName: m.pushName,
                                        noTel: noTel,
                                        quoted: quotedText
                                    }
                                );

                                await sock.sendMessage(id, { text: response }, { quoted: m });
                            } catch (aiError) {
                                logger.error(`Error in autoAI for private chat:`, aiError);
                                await sock.sendMessage(id, {
                                    text: "Waduh, otak gw lagi error nih. Coba lagi ntar ya! 🙏"
                                }, { quoted: m });
                            }
                            return;
                        }

                        // Di grup, cek pengaturan autoai
                        try {
                            const settings = await Group.getSettings(id);
                            if (settings.autoai == 1) {
                                logger.info(`AutoAI activated in group ${id} (explicitly enabled in settings)`);
                                const groupId = `group_${id}`;
                                const quotedText = m.quoted?.text || "";

                                const response = await geminiHandler.chatWithMemory(
                                    fullmessage,
                                    groupId,
                                    {
                                        pushName: m.pushName,
                                        noTel: noTel,
                                        quoted: quotedText
                                    }
                                );

                                await sock.sendMessage(id, { text: response }, { quoted: m });
                            } else {
                                logger.info(`AutoAI skipped in group ${id} (not enabled in settings)`);
                            }
                        } catch (groupError) {
                            logger.error(`Error checking group settings:`, groupError);
                            await sock.sendMessage(id, {
                                text: "Waduh, ada masalah sama pengaturan grupnya nih. Coba lagi ntar ya! 🙏"
                            }, { quoted: m });
                        }
                    } catch (error) {
                        logger.error(`General error in botMentioned handler:`, error);
                        await sock.sendMessage(id, {
                            text: 'Ups, ada yang salah dengan sistem AI-nya. Coba lagi ntar ya!'
                        }, { quoted: m });
                    }
                }

                const chat = await clearMessages(m);
                if (chat) {
                    const parsedMsg = chat.chatsFrom === "private" ? chat.message : chat.participant?.message;
                    if (tebakSession.has(id)) {
                        await checkAnswer(id, parsedMsg.toLowerCase(), sock, m, noTel);
                    } else {
                        await prosesPerintah({ command: parsedMsg, sock, m, id, sender, noTel });
                    }
                }

            } catch (error) {
                logger.error('Error handling message:', error);
            }
        });
        // schedulePrayerReminders(sock, '62895395590009@s.whatsapp.net');
        // schedulePrayerReminders(sock, globalThis.newsLetterJid);
        schedulePrayerReminders(sock, globalThis.groupJid);

        sock.ev.on('group-participants.update', ev => groupParticipants(ev, sock));
        sock.ev.on('groups.update', ev => groupUpdate(ev, sock));
        sock.ev.on('call', (callEv) => {
            call(callEv, sock)
        })
    }).catch(error => logger.error('Fatal error starting bot:', error));

}

globalThis.io.on('connection', (socket) => {
    logger.info('Client connected');

    socket.on('generateQR', async (phoneNumber) => {
        try {
            logger.info(`Received phone number: ${phoneNumber}`);
            await startBot(phoneNumber);
            globalThis.io.emit('botStatus', {
                status: 'success',
                message: `Bot started successfully for number: ${phoneNumber}`
            });
        } catch (error) {
            logger.error('Failed to start bot:', error);
            globalThis.io.emit('botStatus', {
                status: 'error',
                message: `Failed to start bot: ${error.message}`
            });
        }
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('server running at http://0.0.0.0:3000');
});
startBot()

// Fungsi untuk mendapatkan info media dari pesan dengan deteksi yang lebih baik
function getMediaInfo(m) {
    try {
        if (!m || !m.message) {
            return { type: 'unknown', mimetype: null };
        }

        // Cek berbagai jenis pesan media yang umum
        const message = m.message;

        if (message.audioMessage) {
            return {
                type: 'audioMessage',
                mimetype: message.audioMessage.mimetype || 'audio/mp4',
                duration: message.audioMessage.seconds
            };
        }

        if (message.pttMessage) {
            return {
                type: 'pttMessage',
                mimetype: message.pttMessage.mimetype || 'audio/ogg; codecs=opus',
                duration: message.pttMessage.seconds
            };
        }

        // WhatsApp juga bisa menyimpan audio di audioMessage dengan ptt=true
        if (message.audioMessage && message.audioMessage.ptt === true) {
            return {
                type: 'pttMessage',
                mimetype: message.audioMessage.mimetype || 'audio/ogg; codecs=opus',
                duration: message.audioMessage.seconds
            };
        }

        if (message.imageMessage) {
            return {
                type: 'imageMessage',
                mimetype: message.imageMessage.mimetype || 'image/jpeg'
            };
        }

        if (message.videoMessage) {
            return {
                type: 'videoMessage',
                mimetype: message.videoMessage.mimetype || 'video/mp4'
            };
        }

        if (message.documentMessage) {
            return {
                type: 'documentMessage',
                mimetype: message.documentMessage.mimetype
            };
        }

        // Fallback: coba cek dengan Object.keys
        const keys = Object.keys(message);
        if (keys.length > 0) {
            // Coba tentukan tipe dan mimetype dari key pertama
            const type = keys[0];
            let mimetype = null;

            if (message[type] && message[type].mimetype) {
                mimetype = message[type].mimetype;
            }

            // Tambahan deteksi khusus untuk tipe audio
            if (type.includes('audio') || (mimetype && mimetype.includes('audio'))) {
                return { type: 'audioMessage', mimetype: mimetype || 'audio/mp4' };
            }

            if (type.includes('ptt') || type.includes('voice')) {
                return { type: 'pttMessage', mimetype: mimetype || 'audio/ogg; codecs=opus' };
            }

            return { type, mimetype };
        }

        return { type: 'unknown', mimetype: null };
    } catch (error) {
        logger.error(`Error getting media info: ${error.message}`);
        return { type: 'unknown', mimetype: null };
    }
}

// Buat fungsi khusus untuk deteksi apakah pesan adalah audio/VN
function isAudioMessage(m) {
    const { type, mimetype } = getMediaInfo(m);

    return (
        type === 'audioMessage' ||
        type === 'pttMessage' ||
        (mimetype && (
            mimetype.includes('audio') ||
            mimetype.includes('ogg') ||
            mimetype.includes('opus') ||
            mimetype.includes('mp3') ||
            mimetype.includes('wav')
        ))
    );
}

function isImageMessage(m) {
    const { type, mimetype } = getMediaInfo(m);

    return (
        type === 'imageMessage' ||
        (mimetype && (
            mimetype.includes('image') ||
            mimetype.includes('jpg') ||
            mimetype.includes('jpeg') ||
            mimetype.includes('png')
        ))
    );
}

// Handler untuk audio/voice note khusus
async function handleAudioMessage(m) {
    try {
        logger.info(`Handling audio message from ${m.sender}`);
        const { type, mimetype } = getMediaInfo(m);
        logger.info(`Audio details: type=${type}, mimetype=${mimetype || 'unknown'}`);

        // Download audio
        let audioBuffer;
        try {
            audioBuffer = await downloadMediaMessage(
                m,
                'buffer',
                {},
                {
                    logger,
                    reuploadRequest: m.waUploadToServer
                }
            );

            logger.info(`Downloaded audio: ${(audioBuffer.length / 1024).toFixed(2)}KB`);
        } catch (downloadError) {
            logger.error(`Failed to download audio: ${downloadError.message}`);
            await m.reply('Waduh, gw gagal download voice note-nya nih. Coba kirim ulang ya! 🙏');
            return;
        }

        if (!audioBuffer || audioBuffer.length === 0) {
            logger.error('Downloaded audio buffer is empty');
            await m.reply('Voice note yang kamu kirim kosong atau rusak. Coba kirim lagi ya! 🙏');
            return;
        }

        // Buat context untuk GeminiHandler
        const context = {
            id: m.key.id,
            m: m,
            mimetype: mimetype,
            type: type,
            isAudio: true // Flag khusus
        };

        // Tunggu indikator recording
        await m.startTyping();

        // Proses audio dengan GeminiHandler
        logger.info(`Processing audio with GeminiHandler...`);
        const result = await geminiHandler.analyzeAudio(audioBuffer, m.body || '', context);

        if (result.success) {
            await m.reply(result.message);
        } else {
            await m.reply(result.message); // Error message
        }
    } catch (error) {
        logger.error(`Error handling audio message: ${error.message}`);
        await m.reply('Error nih pas proses voice note! Coba lagi ntar ya bestie! 🙏');
    }
}

// Handler untuk gambar khusus
async function handleImageMessage(m) {
    try {
        logger.info(`Handling image message from ${m.sender}`);
        const { type, mimetype } = getMediaInfo(m);
        logger.info(`Image details: type=${type}, mimetype=${mimetype || 'unknown'}`);

        // Download image
        let imageBuffer;
        try {
            imageBuffer = await downloadMediaMessage(
                m,
                'buffer',
                {},
                {
                    logger,
                    reuploadRequest: m.waUploadToServer
                }
            );

            logger.info(`Downloaded image: ${(imageBuffer.length / 1024).toFixed(2)}KB`);
        } catch (downloadError) {
            logger.error(`Failed to download image: ${downloadError.message}`);
            await m.reply('Waduh, gw gagal download gambarnya nih. Coba kirim ulang ya! 🙏');
            return;
        }

        // Buat context untuk GeminiHandler
        const context = {
            id: m.key.id,
            m: m,
            mimetype: mimetype,
            type: type,
            isImage: true // Flag khusus
        };

        // Tunggu indikator typing
        await m.startTyping();

        // Proses gambar dengan GeminiHandler
        logger.info(`Processing image with GeminiHandler...`);
        const result = await geminiHandler.analyzeImage(imageBuffer, m.body || '', context);

        if (result.success) {
            if (result.command && result.skipAnalysis) {
                // Jika ada command terdeteksi (misal sticker), jalankan
                await prosesPerintah(m, result.command, result.args);
            } else {
                // Kirim hasil analisis
                await m.reply(result.message);
            }
        } else {
            await m.reply(result.message); // Error message
        }
    } catch (error) {
        logger.error(`Error handling image message: ${error.message}`);
        await m.reply('Error nih pas proses gambar! Coba lagi ntar ya bestie! 🙏');
    }
}

