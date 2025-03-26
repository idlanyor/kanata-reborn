import './src/global.js'
import { createServer } from 'node:http'
import express from 'express'
import { Server } from 'socket.io'
import { Kanata } from './src/helper/bot.js';
import { groupParticipants, groupUpdate } from './src/lib/group.js';
// import { checkAnswer, tebakSession } from './src/lib/tebak/index.js';
import { getMedia } from './src/helper/mediaMsg.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { call } from './src/lib/call.js';
import { logger } from './src/helper/logger.js';
// import { gpt4Hika } from './src/lib/ai.js';
import { schedulePrayerReminders } from './src/lib/jadwalshalat.js';
import User from './src/database/models/User.js';
import Group from './src/database/models/Group.js';
import { addMessageHandler } from './src/helper/message.js'
// import { autoAI } from './src/lib/autoai.js'
import GeminiHandler from './src/lib/geminiHandler.js';

const app = express()
const server = createServer(app)
globalThis.io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
})
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tambahkan middleware untuk handle JSON dan static files
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

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
    res.sendFile(join(__dirname, 'index.html'))
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
                const phoneRegex = /^\d{9,15}$/;
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
    // if (!command && !attf) return;

    try {

        let cmd = '', args = [];
        if (command && typeof command === 'string') {
            [cmd, ...args] = command.split(' ');

        }
        cmd = cmd.toLowerCase();
        if (command.startsWith('!') || command.startsWith('.')) {
            cmd = command.split(' ')[0].replace('!', '').replace('.', '');
            args = command.split(' ').slice(1);
        }
        console.log(cmd, args)

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
        // const expResult = await User.addExp(noTel, expGained);

        // Jika naik level, kirim notifikasi
        // if (expResult.levelUp) {
        //     await sock.sendMessage(id, {
        //         text: `🎉 Selamat! Level kamu naik ke level ${expResult.newLevel}!`
        //     }, { quoted: {
        //     key: {
        //         remoteJid: 'status@broadcast',
        //         participant: "13135550002@s.whatsapp.net",
        //     },
        //     message: {
        //         newsletterAdminInviteMessage: {
        //             newsletterJid: '120363293401077915@newsletter',
        //             newsletterName: 'Roy',
        //             caption: 'Kanata V3'
        //         }
        //     }
        // } });
        // }

        // Jika ada command, increment counter command
        if (m.body.startsWith('!') || m.body.startsWith('.')) {
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
        console.log(plugins[cmd])
        if (plugins[cmd]) {
            logger.info(`Executing command: ${cmd}`);
            await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf, cmd });
            logger.success(`Command ${cmd} executed successfully`);
        }

        // Handler untuk cek jawaban game tebak
        // if (global.tebakGame && global.tebakGame[id] && global.tebakGame[id].session) {
        //     const answer = global.tebakGame[id].answer.toLowerCase();
        //     const userAnswer = m.body.toLowerCase();

        //     // Jika jawaban benar
        //     if (userAnswer === answer) {
        //         // Clear timeout
        //         clearTimeout(global.tebakGame[id].timeout);

        //         // Tambah point ke user (jika ada sistem point)
        //         await User.addPoints(noTel, 100);

        //         // Hapus sesi game
        //         delete global.tebakGame[id];

        //         // Kirim pesan berhasil
        //         await sock.sendMessage(id, { 
        //             text: `🎉 *BENAR!*\n\n✅ Jawaban: *${answer}*\n💰 Kamu mendapatkan 100 points!`,
        //             contextInfo: {
        //                 externalAdReply: {
        //                     title: '🏆 Jawaban Benar',
        //                     body: '+100 points',
        //                     thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
        //                     sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
        //                     mediaType: 1,
        //                 }
        //             }
        //         });

        //         // Kirim reaksi sukses
        //         await sock.sendMessage(id, { 
        //             react: { 
        //                 text: '🎮', 
        //                 key: m.key 
        //             } 
        //         });
        //     }
        // }

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
    });

    bot.start().then(sock => {
        logger.success('Bot started successfully!');
        logger.divider();
        sock.ev.removeAllListeners('messages.upsert');
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                let m = chatUpdate.messages[0];
                m = addMessageHandler(m, sock);
                // console.log(await sock.groupMetadata('120363347021473313@g.us'))
                if (m.chat.endsWith('@newsletter')) return;
                if (m.key.fromMe) return
                // if (m.isGroup) return
                // if (m.isGroup && !m.isOwner()) return
                // Deteksi media dengan fungsi yang sudah diperbaiki
                const sender = m.pushName;
                const id = m.chat;
                // if(id.endsWith('@g.us')) return
                const noTel = (id.endsWith('@g.us')) ? m.sender.split('@')[0].replace(/[^0-9]/g, '') : m.chat.split('@')[0].replace(/[^0-9]/g, '');
                const botId = sock.user.id.replace(/:\d+/, '');
                const botMentioned = m.message?.extendedTextMessage?.contextInfo?.participant?.includes(botId)
                    || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botId);
                const isGroupChat = id.endsWith('@g.us');

                // Proses button responses
                if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                    const cmd = JSON.parse(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
                    await prosesPerintah({ command: `!${cmd.id}`, sock, m, id, sender, noTel, attf: null, mime: null });
                    return;
                }
                if (m.message?.templateButtonReplyMessage) {
                    const cmd = m.message?.templateButtonReplyMessage?.selectedId;
                    await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel, attf: null, mime: null });
                    return;
                }
                if (m.message?.buttonsResponseMessage) {
                    const cmd = m.message?.buttonsResponseMessage?.selectedButtonId;
                    await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel, attf: null, mime: null });
                    return;
                }

                // Handle media messages first (image, video, audio)
                const mediaTypes = ['image', 'video', 'audio'];
                let isMediaProcessed = false;

                for (const type of mediaTypes) {
                    if (m.type === type || (m.quoted && m.quoted.type === type)) {
                        isMediaProcessed = true;
                        const messageKey = `${type}Message`;
                        const mediaMessage = m.message?.[messageKey] || m.quoted?.message?.[messageKey];

                        if (!mediaMessage) continue;

                        try {
                            const mediaBuffer = await getMedia({ message: { [messageKey]: mediaMessage } });
                            const caption = mediaMessage.caption || m.message?.extendedTextMessage?.text || '';
                            const mime = mediaMessage.mimetype;

                            if (Buffer.isBuffer(mediaBuffer)) {
                                // Handle media dengan command
                                if (caption.startsWith('!') || caption.startsWith('.') || m.body?.startsWith('!') || m.body?.startsWith('.')) {
                                    const command = caption.startsWith('!') || caption.startsWith('.') ? caption : m.body;
                                    await prosesPerintah({
                                        command,
                                        sock, m, id,
                                        sender, noTel,
                                        attf: mediaBuffer,
                                        mime
                                    });
                                    return;
                                }

                                // Khusus untuk gambar, proses dengan Gemini jika bot di-mention/reply
                                if (type === 'image') {
                                    if (isGroupChat) {
                                        // Di grup harus di-mention/reply
                                        if (!botMentioned && !m.quoted?.participant?.includes(botId)) continue;

                                        // Cek apakah autoai diaktifkan di grup
                                        const settings = await Group.getSettings(id);
                                        if (settings.autoai !== 1) continue;
                                    }

                                    const imageResponse = await geminiHandler.analyzeImage(
                                        mediaBuffer,
                                        caption || m.body || '',
                                        { id, m }
                                    );
                                    await sock.sendMessage(id, {
                                        text: imageResponse.message
                                    }, {
                                        quoted: m
                                    });
                                    return;
                                }
                                if (type === 'audio') {
                                    // Jika di grup dan tidak ada caption, return
                                    if (isGroupChat && !caption) {
                                        // Cek apakah autoai diaktifkan
                                        const settings = await Group.getSettings(id);
                                        if (settings.autoai !== 1) return;
                                    }

                                    const audioResponse = await geminiHandler.analyzeAudio(
                                        mediaBuffer,
                                        caption || m.body || '',
                                        { id, m }
                                    );
                                    await sock.sendMessage(id, {
                                        text: audioResponse.message
                                    }, {
                                        quoted: m
                                    });
                                    return;
                                }
                            }
                        } catch (error) {
                            logger.error(`Error processing ${type}:`, error);
                        }
                    }
                }

                // Jika bukan media message, proses text message
                if (!isMediaProcessed && m.type === 'text') {
                    // Handle pesan dengan prefix . atau !
                    if (m.body && (m.body.startsWith('!') || m.body.startsWith('.'))) {
                        await prosesPerintah({ command: m.body, sock, m, id, sender, noTel, attf: null, mime: null });
                        return;
                    }

                    // Auto AI untuk mention bot
                    if (botMentioned) {
                        if (m.key.fromMe) return;

                        try {
                            // Cek apakah ini private chat atau grup
                            if (!isGroupChat) {
                                logger.info(`AutoAI diaktifkan di private chat dengan ${m.pushName || noTel}`);
                                const userId = `private_${noTel}`;
                                const quotedText = m.quoted?.text || "";

                                try {
                                    const response = await geminiHandler.chatWithMemory(
                                        m.body,
                                        userId,
                                        {
                                            pushName: m.pushName,
                                            noTel: noTel,
                                            quoted: quotedText
                                        }
                                    );
                                    await sock.sendMessage(id, { text: response }, {
                                        quoted: m
                                    });
                                } catch (aiError) {
                                    logger.error(`Error di autoAI private chat:`, aiError);
                                    await sock.sendMessage(id, {
                                        text: "Maaf, terjadi kesalahan. Coba lagi nanti ya! 🙏"
                                    }, {
                                        quoted: m
                                    });
                                }
                                return;
                            }

                            // Untuk grup chat
                            const settings = await Group.getSettings(id);
                            if (settings.autoai === 1) {
                                logger.info(`AutoAI diaktifkan di grup ${id}`);
                                const groupId = `group_${id}`;
                                const quotedText = m.quoted?.text || "";

                                try {
                                    const response = await geminiHandler.chatWithMemory(
                                        m.body,
                                        groupId,
                                        {
                                            pushName: m.pushName,
                                            noTel: noTel,
                                            quoted: quotedText
                                        }
                                    );
                                    await sock.sendMessage(id, { text: response }, {
                                        quoted: m
                                    });
                                } catch (aiError) {
                                    logger.error(`Error di autoAI grup:`, aiError);
                                    await sock.sendMessage(id, {
                                        text: "Maaf, terjadi kesalahan. Coba lagi nanti ya! 🙏"
                                    }, {
                                        quoted: m
                                    });
                                }
                            } else {
                                logger.info(`AutoAI tidak aktif di grup ${id}`);
                            }
                        } catch (error) {
                            logger.error(`Error umum di handler botMentioned:`, error);
                            await sock.sendMessage(id, {
                                text: 'Ups, ada yang salah dengan sistem AI-nya. Coba lagi nanti ya!'
                            }, {
                                quoted: {
                                    key: {
                                        remoteJid: 'status@broadcast',
                                        participant: "13135550002@s.whatsapp.net",
                                    },
                                    message: {
                                        newsletterAdminInviteMessage: {
                                            newsletterJid: '120363293401077915@newsletter',
                                            newsletterName: 'Roy',
                                            caption: 'Kanata V3'
                                        }
                                    }
                                }
                            });
                        }
                        return;
                    }

                    // Handle pesan teks biasa (minimal 3 karakter)
                    if (m.body && m.body.length >= 3 && sender !== globalThis.botNumber) {
                        // Untuk grup chat, hanya proses jika autoai aktif dan bot di-mention/reply
                        if (isGroupChat) {
                            const settings = await Group.getSettings(id);
                            if (settings.autoai !== 1) return;

                            // Di grup harus di-mention atau di-reply
                            if (!botMentioned && !m.quoted?.participant?.includes(botId)) return;
                        }

                        // Jika sampai di sini berarti:
                        // 1. Ini private chat, atau
                        // 2. Ini grup dengan autoai aktif dan bot di-mention/reply
                        try {
                            logger.info(`Processing message: ${m.body.substring(0, 30)}...`);
                            const response = await geminiHandler.analyzeMessage(m.body);

                            if (response.success && response.command) {
                                // Jika ada command yang terdeteksi
                                const pluginsDir = path.join(__dirname, 'src/plugins');
                                const plugins = Object.fromEntries(
                                    await Promise.all(findJsFiles(pluginsDir).map(async file => {
                                        const { default: plugin, handler } = await import(pathToFileURL(file).href);
                                        if (Array.isArray(handler) && handler.includes(response.command)) {
                                            return [response.command, plugin];
                                        }
                                        return [handler, plugin];
                                    }))
                                );

                                if (plugins[response.command]) {
                                    await sock.sendMessage(id, { text: response.message });
                                    await plugins[response.command]({
                                        sock, m, id,
                                        psn: response.args,
                                        sender, noTel,
                                        attf: null,
                                        cmd: response.command
                                    });
                                } else {
                                    // Command tidak ditemukan, gunakan chat biasa
                                    const chatResponse = await geminiHandler.chat(m.body);
                                    await sock.sendMessage(id, { text: chatResponse }, {
                                        quoted: m
                                    });
                                }
                            } else {
                                // Tidak ada command, gunakan chat biasa
                                const chatResponse = await geminiHandler.chat(m.body);
                                await sock.sendMessage(id, { text: chatResponse }, {
                                    quoted: {
                                        key: {
                                            remoteJid: 'status@broadcast',
                                            participant: "13135550002@s.whatsapp.net",
                                        },
                                        message: {
                                            newsletterAdminInviteMessage: {
                                                newsletterJid: '120363293401077915@newsletter',
                                                newsletterName: 'Roy',
                                                caption: 'Kanata V3'
                                            }
                                        }
                                    }
                                });
                            }
                        } catch (error) {
                            logger.error('Error in message processing:', error);
                            await sock.sendMessage(id, {
                                text: "Maaf, terjadi kesalahan. Coba lagi nanti ya! 🙏"
                            }, {
                                quoted: {
                                    key: {
                                        remoteJid: 'status@broadcast',
                                        participant: "13135550002@s.whatsapp.net",
                                    },
                                    message: {
                                        newsletterAdminInviteMessage: {
                                            newsletterJid: '120363293401077915@newsletter',
                                            newsletterName: 'Roy',
                                            caption: 'Kanata V3'
                                        }
                                    }
                                }
                            });
                        }
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

server.listen(3000, '0.0.0.0', () => {
    console.log('server running at http://0.0.0.0:3000');
});
startBot()
