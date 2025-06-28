import './src/global.js'
import { createServer } from 'node:http'
import express from 'express'
import { Server } from 'socket.io'
import { Kanata } from './src/helper/bot.js';
import { groupParticipants, groupUpdate } from './src/lib/group.js';
import { checkAnswer } from './src/lib/tebak/index.js';
import { getMedia } from './src/helper/mediaMsg.js';
import chokidar from 'chokidar';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { exec } from 'child_process'
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
export const findJsFiles = (dir) => {
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

function watchCodeChanges() {
    const directories = [
        path.join(__dirname, 'src/plugins'),
        path.join(__dirname, 'src/lib'),
        path.join(__dirname, 'src/helper'),
        // path.join(__dirname, 'app.js'),
        path.join(__dirname, 'src/global.js'),
    ];

    logger.info('🔥 Ngejagain file kek bodyguard, siap mantau perubahan...');

    const watcher = chokidar.watch(directories, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: false,
        usePolling: true, // biar konsisten di semua platform
        interval: 1000, // mirip kayak yang di fs.watchFile
    });

    watcher.on('change', async (filePath) => {
        const relativePath = path.relative(__dirname, filePath);
        logger.info(`📢 File berubah: ${relativePath}`);

        try {
            const fileURL = pathToFileURL(filePath).href;
            const modulePath = `${fileURL}?update=${Date.now()}`;
            await import(modulePath);

            if (filePath.includes('/plugins/')) {
                logger.success(` Plugin di-reload: ${relativePath}`);
            } else if (filePath.endsWith('global.js')) {
                logger.success(`Global config di-reload: ${relativePath}`);
            } else {
                logger.info(`✅ Module updated: ${relativePath}`);
            }
        } catch (err) {
            logger.error(`💥 Error waktu reload ${relativePath}:`, err);
        }
    });
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

// Tambahkan fungsi helper untuk mengecek sesi game
const isGameSession = (id) => {
    return global.tebakGame && global.tebakGame[id] && global.tebakGame[id].session;
};

// Tambahkan fungsi untuk handle AI response
const handleAIResponse = async (sock, m, id, noTel, isGroupChat, settings) => {
    // Cek sesi game terlebih dahulu
    if (isGameSession(id)) {
        // Jika ada sesi game dan user mention bot, beri peringatan
        if (m.body.includes('@' + sock.user.id.split(':')[0])) {
            await sock.sendMessage(id, {
                text: "🎮 Sedang ada sesi game berlangsung. Selesaikan dulu gamenya ya!"
            }, { quoted: m });
        }
        return true; // Return true untuk menandakan ada sesi game
    }
    return false; // Return false jika tidak ada sesi game
};

// Tambahkan rate limiting untuk grup
const groupCooldowns = new Map();
const COOLDOWN_DURATION = 2000; // 2 detik cooldown per grup

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
    // Cek cooldown untuk grup
    if (id.endsWith('@g.us')) {
        const lastUsage = groupCooldowns.get(id);
        const now = Date.now();
        
        if (lastUsage && (now - lastUsage) < COOLDOWN_DURATION) {
            return; // Skip jika masih dalam cooldown
        }
        
        groupCooldowns.set(id, now);
    }

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

        // logger.info(`Pesan baru diterima dari ${m.pushName}`);
        // logger.message.in(command);

        // Inisialisasi pengaturan grup jika pesan dari grup
        if (id.endsWith('@g.us')) {
            await Group.initGroup(id);
            const settings = await Group.getSettings(id);

            // Optimasi pengecekan fitur grup
            const checks = [];
            
            if (settings.antispam) {
                checks.push(Group.checkSpam(noTel, id));
            }
            if (settings.antipromosi) {
                checks.push(import('./src/plugins/hidden/events/antipromosi.js')
                    .then(({ default: antipromosi }) => 
                        antipromosi({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' })));
            }
            if (settings.antilink) {
                checks.push(import('./src/plugins/hidden/events/antilink.js')
                    .then(({ default: antilink }) => 
                        antilink({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' })));
            }
            if (settings.antitoxic) {
                checks.push(import('./src/plugins/hidden/events/antitoxic.js')
                    .then(({ default: antitoxic }) => 
                        antitoxic({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' })));
            }
            
            // Jalankan semua pengecekan secara paralel
            await Promise.all(checks);
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
        if (expResult.levelUp) {
            await sock.sendMessage(id, {
                text: `🎉 *LEVEL UP!*\n\n` +
                    `📊 Level kamu naik ke level ${expResult.newLevel}!\n` +
                    `✨ EXP: ${expResult.currentExp}/${expResult.expNeeded}`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎮 Level Up!',
                        body: `${m.pushName} naik ke level ${expResult.newLevel}`,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

            // Tambah reaksi level up
            await sock.sendMessage(id, {
                react: {
                    text: '⭐',
                    key: m.key
                }
            });
        }

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
        if (plugins[cmd]) {
            logger.info(`Executing command: ${cmd}`);
            await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf, cmd });
            logger.success(`Command ${cmd} executed successfully`);
            return;
        }

        // Handler untuk cek jawaban game tebak
        if (global.tebakGame && global.tebakGame[id] && global.tebakGame[id].session) {
            // Tambahkan debug log
            // console.log('Game Session Active:', {
            //     id: id,
            //     userInput: m.body,
            //     gameAnswer: global.tebakGame[id].answer,
            //     messageType: m.type,
            //     fullMessage: m // log full message object untuk cek struktur
            // });

            if (m.body.startsWith('!') || m.body.startsWith('.')) {
                return;
            }

            const answer = global.tebakGame[id].answer.toLowerCase().trim(); // tambah trim()
            const userAnswer = m.body.toLowerCase().trim(); // tambah trim()

            // console.log('Comparing answers:', {
            //     userAnswer: userAnswer,
            //     correctAnswer: answer,
            //     isEqual: userAnswer === answer
            // });

            // Jika jawaban benar
            if (userAnswer === answer) {
                // console.log('Correct answer!');
                // Clear timeout
                clearTimeout(global.tebakGame[id].timeout);

                // Tambah point ke user (jika ada sistem point)
                await User.addPoints(noTel, 100);

                // Hapus sesi game
                delete global.tebakGame[id];
                // console.log('Game session cleared after correct answer');

                // Kirim pesan berhasil
                await sock.sendMessage(id, {
                    text: `🎉 *BENAR!*\n\n✅ Jawaban: *${answer}*\n💰 Kamu mendapatkan 100 points!`,
                    contextInfo: {
                        externalAdReply: {
                            title: '🏆 Jawaban Benar',
                            body: '+100 points',
                            thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                            mediaType: 1,
                        }
                    }
                });

                // Kirim reaksi sukses
                await sock.sendMessage(id, {
                    react: {
                        text: '🎮',
                        key: m.key
                    }
                });
            } else {
                // Tambah debug untuk jawaban salah
                // console.log('Wrong answer details:', {
                //     userAnswerLength: userAnswer.length,
                //     correctAnswerLength: answer.length,
                //     userAnswerChars: Array.from(userAnswer),
                //     correctAnswerChars: Array.from(answer)
                // });

                await sock.sendMessage(id, {
                    text: '❌ Jawaban salah, coba lagi!'
                });
            }
            return;
        }

    } catch (error) {
        logger.error('Error in message processing:', error);
        await sock.sendMessage(id, {
            text: "Waduh error nih bestie! Coba lagi ntar ya 🙏"
        });
    }
}

// Optimasi cache untuk plugin
const pluginCache = new Map();
async function loadPlugin(cmd) {
    if (pluginCache.has(cmd)) {
        return pluginCache.get(cmd);
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

    pluginCache.set(cmd, plugins[cmd]);
    return plugins[cmd];
}

export async function startBot() {
    const bot = new Kanata(globalThis.sessionName);

    bot.start().then(sock => {
        logger.success('Bot started successfully!');
        logger.divider();

        // Gunakan process untuk semua events
        sock.ev.process(
            async (events) => {
                // Messages.upsert
                if (events['messages.upsert']) {
                    const chatUpdate = events['messages.upsert'];
                    try {
                        let m = chatUpdate.messages[0];
                        m = addMessageHandler(m, sock);
                        if (m.chat.endsWith('@newsletter')) return;
                        if (m.chat.endsWith('@broadcast')) return;
                        if (m.key.fromMe) return
                        // if (m.isGroup) return
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
                        const mediaTypes = ['image', 'video', 'audio', 'document'];
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

                                    if (Buffer.isBuffer(mediaBuffer.buffer)) {
                                        // Handle media dengan command
                                        if (caption.startsWith('!') || caption.startsWith('.') || m.body?.startsWith('!') || m.body?.startsWith('.')) {
                                            // const command = m.quoted?.text || caption.startsWith('!') || caption.startsWith('.') ? caption : m.quoted?.text;
                                            const command = m.quoted?.text || caption

                                            await prosesPerintah({
                                                command,
                                                sock, m, id,
                                                sender, noTel,
                                                attf: mediaBuffer.buffer,
                                                mime: mediaBuffer.mimetype,
                                                filename: mediaBuffer.fileName,
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

                                            // Cek sesi game sebelum proses AI
                                            if (await handleAIResponse(sock, m, id, noTel, isGroupChat, null)) {
                                                continue;
                                            }

                                            const imageResponse = await geminiHandler.analyzeImage(
                                                mediaBuffer.buffer,
                                                m.quoted?.text || caption || m.body,
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
                                                mediaBuffer.buffer,
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
                            // Handle game answers first
                            if (global.tebakGame && global.tebakGame[id] && global.tebakGame[id].session) {
                                if (!m.body.startsWith('!') && !m.body.startsWith('.')) {
                                    console.log('Processing game answer:', m.body);
                                    await checkAnswer(id, m.body, sock, m, noTel);
                                    return;
                                }
                            }

                            // Then handle commands
                            if (m.body && (m.body.startsWith('!') || m.body.startsWith('.'))) {
                                const command = m.quoted?.text || m.body;
                                await prosesPerintah({ command, sock, m, id, sender, noTel, attf: null, mime: null });
                                return;
                            }

                            // Auto AI untuk mention bot
                            if (botMentioned) {
                                if (m.key.fromMe) return;

                                // Cek sesi game
                                if (await handleAIResponse(sock, m, id, noTel, isGroupChat, null)) {
                                    return;
                                }

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
                                    console.log('hallo', settings)
                                    if (settings.autoai) {
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

                            // Tambahkan pengecekan sesi game
                            if (global.tebakGame && global.tebakGame[id] && global.tebakGame[id].session) {
                                return; // Skip proses autoAI jika sedang ada sesi game
                            }

                            // Handle pesan teks biasa (minimal 3 karakter)
                            if (m.body && m.body.length >= 3 && sender !== globalThis.botNumber) {
                                // Untuk grup chat, hanya proses jika autoai aktif dan bot di-mention/reply
                                if (isGroupChat) {
                                    const settings = await Group.getSettings(id);
                                    if (settings.autoai !== 1) return;

                                    // Cek sesi game
                                    if (await handleAIResponse(sock, m, id, noTel, isGroupChat, settings)) {
                                        return;
                                    }

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
                }

                // Group participants update
                if (events['group-participants.update']) {
                    groupParticipants(events['group-participants.update'], sock);
                }

                // Groups update
                if (events['groups.update']) {
                    groupUpdate(events['groups.update'], sock);
                }

                // Call events
                if (events['call']) {
                    call(events['call'], sock);
                }

                
            }
        );

    }).catch(error => logger.error('Fatal error starting bot:', error));
}

// server.listen(3037, '0.0.0.0', () => {
//     console.log('server running at http://0.0.0.0:3037');
// });
watchCodeChanges();
startBot()
