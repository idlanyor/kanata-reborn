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
    if (!command) return;
    if (m.key.fromMe) return;

    try {
        // Skip untuk pesan pendek atau dari bot
        if (command.length < 3 || sender === globalThis.botNumber) {
            return;
        }

        // =================================
        // SISTEM PEMROSESAN PESAN
        // =================================
        // 1. Private Chat: Menggunakan Gemini AI untuk analisis natural language
        //    - Mencoba mengenali command dari bahasa natural
        //    - Chat biasa jika tidak ada command yang cocok
        // 2. Group Chat: Hanya mengenali command dengan prefix (! atau .)
        //    - AutoAI hanya aktif jika diaktifkan di pengaturan grup
        // =================================
        
        // Cek apakah chat private atau grup
        const isPrivateChat = !id.endsWith('@g.us');
        
        // Gunakan Gemini AI hanya untuk private chat
        if (isPrivateChat) {
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

        // Proses sebagai command biasa (untuk grup atau jika Gemini gagal di private chat)
        let [cmd, ...args] = command.split(' ');
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
                await autoAI(m, sock)
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
                    // if (m.key.fromMe) return
                    try {
                        // Strategi AutoAI:
                        // 1. Private chat: Selalu aktif
                        // 2. Group chat: Aktif hanya jika setting autoai = 1
                        
                        // Di private chat, selalu aktifkan AutoAI
                        if (isPrivateChat) {
                            logger.info(`AutoAI activated in private chat with ${m.pushName}`);
                            await sock.sendMessage(id, { text: await gpt4Hika({ prompt: `${fullmessage} ${ctx}`, id }) }, { quoted: m });
                            return;
                        } 
                        
                        // Di grup, cek pengaturan autoai
                        if ((await Group.getSettings(id)).autoai == 1) {
                            logger.info(`AutoAI activated in group ${id} (explicitly enabled in settings)`);
                            await sock.sendMessage(id, { text: await gpt4Hika({ prompt: `${fullmessage} ${ctx}`, id }) }, { quoted: m });
                        } else {
                            logger.info(`AutoAI skipped in group ${id} (not enabled in settings)`);
                        }
                    } catch (error) {
                        await sock.sendMessage(id, { text: 'Ups, ada yang salah' }, { quoted: m });
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