import { makeWASocket, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, makeInMemoryStore, useMultiFileAuthState, DisconnectReason } from '@fizzxydev/baileys-pro';
import { logger } from '../../helper/logger.js';
import NodeCache from "node-cache";
import pino from "pino";
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { addMessageHandler } from '../../helper/message.js';
import User from '../../database/models/User.js';
import Group from '../../database/models/Group.js';
import { findJsFiles } from '../../../app.js';

const sessions = new Map();
const SESSION_FOLDER = 'jadibots';

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
    level: "silent"
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginsDir = join(__dirname, '../../plugins');

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!m.isOwner) {
            await m.reply('🔒 Fitur ini khusus owner bot!');
            return;
        }

        if (!psn) {
            await m.reply(`📱 *JADIBOT SYSTEM*\n\n*Format:* .jadibot nomor\n*Contoh:* .jadibot 628123456789\n\n*Note:*\n- Nomor harus aktif di WhatsApp\n- Session berlaku 24 jam\n- Restart otomatis jika terputus`);
            return;
        }

        let targetNumber = psn.replace(/[^0-9]/g, '');
        targetNumber = targetNumber + '@s.whatsapp.net';

        const [result] = await sock.onWhatsApp(targetNumber);
        console.log(result)
        if (!result?.exists) {
            await m.reply('❌ Nomor tidak terdaftar di WhatsApp!');
            return;
        }

        if (sessions.has(targetNumber)) {
            await m.reply('⚠️ Nomor ini sudah menjadi bot!');
            return;
        }

        const sessionId = crypto.randomBytes(16).toString('hex');
        const sessionDir = path.join(process.cwd(), SESSION_FOLDER, targetNumber.split('@')[0]);

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        await m.react('⏳');

        const msgRetryCounterCache = new NodeCache();
        const logger = MAIN_LOGGER.child({});

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        const store = makeInMemoryStore({ logger });
        store.readFromFile(`${sessionDir}/store.json`);
        
        const storeInterval = setInterval(() => {
            store.writeToFile(`${sessionDir}/store.json`);
        }, 10000 * 6);

        const jadibotSock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
            browser: Browsers.macOS("Safari"),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            emitOwnEvents: true,
            fireInitQueries: true,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            retryRequestDelayMs: 2000
        });

        store?.bind(jadibotSock.ev);
        jadibotSock.ev.on('creds.update', saveCreds);

        sessions.set(targetNumber, {
            socket: jadibotSock,
            sessionId,
            startTime: Date.now(),
            store,
            storeInterval
        });

        jadibotSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            console.log('[JADIBOT CONNECTION UPDATE]', update);
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    await m.reply('🔄 Koneksi terputus, mencoba menghubungkan kembali...');
                    sessions.delete(targetNumber);
                    setTimeout(async () => {
                        await startJadibot(targetNumber, sessionDir, sock, m);
                    }, 3000);
                } else {
                    cleanupSession(targetNumber, sessionDir);
                    await m.reply('❌ Session invalid, silahkan buat ulang!');
                }
                return;
            }

            if (connection === 'open') {
                sessions.set(targetNumber, {
                    socket: jadibotSock,
                    sessionId,
                    startTime: Date.now(),
                    store
                });

                await m.reply(`✅ *Berhasil terhubung!*\n\n*Device:*\n${JSON.stringify(jadibotSock.user, null, 2)}\n\n*Session akan berakhir dalam 24 jam*`);
                await sock.sendMessage(targetNumber, {
                    text: `🤖 *JADIBOT AKTIF*\n\n- Ketik .menu untuk melihat fitur\n- Hanya ada mode self(untuk public hubungi atemin/owner)\n- Restart otomatis jika terputus\n\n_Powered by Kanata Bot_`
                });
            }
        });

        if (!jadibotSock.authState.creds.registered) {
            const code = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const pairingCode = await jadibotSock.requestPairingCode(targetNumber.split('@')[0]);
                        resolve(pairingCode);
                    } catch (err) {
                        reject(err);
                    }
                }, 3000); // delay 3 detik sebelum request
            });

            await sock.sendMessage(targetNumber, {
                text: `🔑 *KODE PAIRING KAMU*\n\n${code}\n\n*Cara Pairing:*\n1. Buka WhatsApp\n2. Klik Perangkat Tertaut\n3. Klik Tautkan Perangkat\n4. Masukkan kode di atas`
            });

            await m.reply(`✅ Kode pairing telah dikirim ke wa.me/${targetNumber.split('@')[0]}`);
        }

        setTimeout(() => {
            cleanupSession(targetNumber, sessionDir);
        }, 24 * 60 * 60 * 1000);

    } catch (error) {
        logger.error('Jadibot Error:', error);
        await m.reply(`❌ Error: ${error.message}`);
        await m.react('❌');
    }
};

async function startJadibot(number, dir, sock, m, isRestore = false) {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(dir);
        const { version } = await fetchLatestBaileysVersion();
        
        const msgRetryCounterCache = new NodeCache();
        const logger = MAIN_LOGGER.child({});

        const store = makeInMemoryStore({ logger });
        store.readFromFile(`${dir}/store.json`);
        
        const storeInterval = setInterval(() => {
            store.writeToFile(`${dir}/store.json`);
            saveSessionsToFile();
        }, 30 * 24 * 60 * 60 * 1000);

        const newSock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
            browser: Browsers.macOS("Safari"),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            emitOwnEvents: true,
            fireInitQueries: true,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            retryRequestDelayMs: 2000
        });

        store?.bind(newSock.ev);
        newSock.ev.on('creds.update', saveCreds);

        let retriesLeft = 1; // Tambahkan counter untuk retry
                
        newSock.ev.process(
            async (events) => {
                if (events['creds.update']) {
                    await saveCreds();
                }

                if (events['connection.update']) {
                    const update = events['connection.update'];
                    const { connection, lastDisconnect } = update;
                    
            if (connection === 'open') {
                        retriesLeft = 3; // Reset counter saat berhasil connect
                        sessions.set(number, {
                            socket: newSock,
                            startTime: Date.now(),
                            store,
                            storeInterval
                        });
                        
                        if (!isRestore && m) {
                await m.reply('✅ Berhasil terhubung kembali!');
                        }
                
                try {
                    await newSock.sendMessage(number, {
                        text: `🤖 *BOT STATUS UPDATE*\n\n✅ Terhubung kembali\n⏰ Waktu: ${new Date().toLocaleString()}`
                    });
                } catch (err) {
                    console.error('Error sending status message:', err);
                }
            } else if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                        // Clear interval
                        const session = sessions.get(number);
                        if (session?.storeInterval) {
                            clearInterval(session.storeInterval);
                        }
                
                        // Handle reconnect dengan lebih baik
                        if (shouldReconnect && retriesLeft > 0) {
                            console.log(`Mencoba menghubungkan ulang... (${retriesLeft} kesempatan tersisa)`);
                            retriesLeft--;
                            
                            // Tunggu sebentar sebelum reconnect
                            await new Promise(resolve => setTimeout(resolve, 3000));

                            try {
                                if (!isRestore && m) {
                                    await m.reply(`🔄 Mencoba menghubungkan ulang... (${retriesLeft + 1} kesempatan tersisa)`);
                                }
                                
                                // Jika belum terdaftar, coba request pairing code lagi
                                if (!newSock.authState.creds.registered) {
                                    try {
                                        const code = await newSock.requestPairingCode(number.split('@')[0]);
                                        await sock.sendMessage(number, {
                                            text: `🔑 *KODE PAIRING BARU*\n\n${code}\n\n*Cara Pairing:*\n1. Buka WhatsApp\n2. Klik Perangkat Tertaut\n3. Klik Tautkan Perangkat\n4. Masukkan kode di atas`
                                        });
                                    } catch (err) {
                                        console.error('Error requesting pairing code:', err);
                                    }
                                }

                            await startJadibot(number, dir, sock, m);
                        } catch (err) {
                            console.error('Reconnect error:', err);
                                if (retriesLeft > 0) {
                            setTimeout(async () => {
                                await startJadibot(number, dir, sock, m);
                            }, 10000);
                                } else {
                                    cleanupSession(number, dir);
                                    if (!isRestore && m) {
                                        await m.reply('❌ Gagal menghubungkan setelah beberapa percobaan. Silahkan buat ulang session.');
                                    }
                                }
                            }
                } else {
                    cleanupSession(number, dir);
                            if (!isRestore && m) {
                                await m.reply('❌ Session invalid atau melebihi batas percobaan, silahkan buat ulang!');
                            }
                }
            }
                }

                if (events['messages.upsert']) {
                    const chatUpdate = events['messages.upsert'];
                    try {
                        let msg = chatUpdate.messages[0];
                        msg = addMessageHandler(msg, newSock);
                        
                        if (msg.chat.endsWith('@newsletter')) return;
                        if (msg.chat.endsWith('@broadcast')) return;
                        console.log(msg)
                        console.log(msg.key.fromMe)
                        if (!msg.key.fromMe) return;

                        const sender = msg.pushName;
                        const id = msg.chat;
                        const noTel = (id.endsWith('@g.us')) 
                            ? msg.sender.split('@')[0].replace(/[^0-9]/g, '') 
                            : msg.chat.split('@')[0].replace(/[^0-9]/g, '');

                        // Handle grup settings jika pesan dari grup
                        if (id.endsWith('@g.us')) {
                            await Group.initGroup(id);
                            const settings = await Group.getSettings(id);
                            
                            // Cek fitur grup (antispam, antipromosi, dll)
                            if (settings.antispam) {
                                const spamCheck = await Group.checkSpam(noTel, id);
                                if (spamCheck.isSpam) {
                                    await Group.incrementWarning(noTel, id);
                                    if (spamCheck.warningCount >= 3) {
                                        await newSock.groupParticipantsUpdate(id, [noTel], 'remove');
                                        await newSock.sendMessage(id, {
                                            text: `@${noTel.split('@')[0]} telah dikeluarkan karena spam`,
                                            mentions: [noTel]
                                        });
                                        return;
                                    }
                                    await newSock.sendMessage(id, {
                                        text: `⚠️ @${noTel.split('@')[0]} Warning ke-${spamCheck.warningCount + 1} untuk spam!`,
                                        mentions: [noTel]
                                    });
                                    return;
                                }
                            }
                        }

                        // Cek dan buat user jika belum ada
                        let user = await User.getUser(noTel);
                        if (!user) {
                            await User.create(noTel, msg.pushName || 'User');
                        }

                        // Handle commands
                        if (msg.body && (msg.body.startsWith('!') || msg.body.startsWith('.'))) {
                            const command = msg.quoted?.text || msg.body;
                            await prosesPerintah({ 
                                command, 
                                sock: newSock, 
                                m: msg, 
                                id, 
                                sender, 
                                noTel, 
                                attf: null 
                            });
                        }

                        // Handle media messages
                        if (msg.type === 'imageMessage' || msg.type === 'videoMessage' || 
                            msg.type === 'documentMessage' || msg.type === 'audioMessage') {
                            const caption = msg.message?.[`${msg.type}`]?.caption || '';
                            if (caption.startsWith('!') || caption.startsWith('.')) {
                                await prosesPerintah({
                                    command: caption,
                                    sock: newSock,
                                    m: msg,
                                    id,
                                    sender,
                                    noTel,
                                    attf: msg.message
                                });
                            }
                        }

                    } catch (error) {
                        console.error('Error handling message:', error);
                    }
                }
            }
        );

    } catch (error) {
        console.error('Reconnect Error:', error);
        if (m) await m.reply('❌ Gagal menghubungkan kembali! Mencoba lagi dalam 5 detik...');
        setTimeout(async () => {
            await startJadibot(number, dir, sock, m);
        }, 5000);
    }
}

function cleanupSession(number, dir) {
    const session = sessions.get(number);
    if (session?.storeInterval) {
        clearInterval(session.storeInterval);
    }
    sessions.delete(number);
    saveSessionsToFile();
    if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    }
}

function saveSessionsToFile() {
    const sessionData = {};
    sessions.forEach((value, key) => {
        sessionData[key] = {
            sessionId: value.sessionId,
            startTime: value.startTime,
            dir: path.join(process.cwd(), SESSION_FOLDER, key.split('@')[0])
        };
    });
    fs.writeFileSync('jadibot-sessions.json', JSON.stringify(sessionData, null, 2));
}

async function loadSavedSessions(sock) {
    try {
        if (fs.existsSync('jadibot-sessions.json')) {
            const sessionData = JSON.parse(fs.readFileSync('jadibot-sessions.json'));
            for (const [number, data] of Object.entries(sessionData)) {
                if (fs.existsSync(data.dir)) {
                    console.log(`Memulai ulang session untuk ${number}...`);
                    await startJadibot(number, data.dir, sock, null, true);
                }
            }
        }
    } catch (error) {
        console.error('Error loading saved sessions:', error);
    }
}

function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
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

        // Load plugins
        const plugins = Object.fromEntries(
            await Promise.all(findJsFiles(pluginsDir).map(async file => {
                const { default: plugin, handler, command } = await import(pathToFileURL(file).href);
                if (Array.isArray(command) && command.includes(cmd)) {
                    return [cmd, plugin];
                }
                return [handler, plugin];
            }))
        );

        if (plugins[cmd]) {
            await plugins[cmd]({ 
                sock, 
                m: {
                    ...m,
                    reply: (text) => sock.sendMessage(id, { text }, { quoted: m }),
                    react: (emoji) => sock.sendMessage(id, { 
                        react: { text: emoji, key: m.key }
                    })
                }, 
                id, 
                psn: args.join(' '), 
                sender, 
                noTel,
                attf
            });
        }
    } catch (error) {
        console.error('Error processing command:', error);
    }
}

export const handler = 'jadibot';
export const tags = ['owner'];
export const command = ['jadibot'];
export const help = 'Jadikan nomor lain sebagai bot (Owner Only)';

export { loadSavedSessions };
