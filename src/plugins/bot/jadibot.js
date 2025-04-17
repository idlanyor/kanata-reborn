import { makeWASocket, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, makeInMemoryStore, useMultiFileAuthState, DisconnectReason } from '@fizzxydev/baileys-pro';
import { logger } from '../../helper/logger.js';
import NodeCache from "node-cache";
import pino from "pino";
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const sessions = new Map();
const SESSION_FOLDER = 'jadibots';

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
        const MAIN_LOGGER = pino({
            timestamp: () => `,"time":"${new Date().toJSON()}"`,
            level: "silent",
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            }
        });

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        const store = makeInMemoryStore({ logger });
        store.readFromFile(`${sessionDir}/store.json`);
        setInterval(() => {
            store.writeToFile(`${sessionDir}/store.json`);
        }, 10000 * 6);

        const jadibotSock = makeWASocket({
            version,
            logger: MAIN_LOGGER,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, MAIN_LOGGER),
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

        jadibotSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            console.log('[JADIBOT CONNECTION UPDATE]', update);
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

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
                    text: `🤖 *JADIBOT AKTIF*\n\n- Ketik .menu untuk melihat fitur\n- Session berlaku 24 jam\n- Restart otomatis jika terputus\n\n_Powered by Kanata Bot_`
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
        const MAIN_LOGGER = pino({
            timestamp: () => `,"time":"${new Date().toJSON()}"`,
            level: "silent",
            transport: {
                target: 'pino-pretty',
                options: { colorize: true }
            }
        });

        const store = makeInMemoryStore({ logger: MAIN_LOGGER });
        store.readFromFile(`${dir}/store.json`);
        
        const newSock = makeWASocket({
            version,
            logger: MAIN_LOGGER,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, MAIN_LOGGER),
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

        // Auto-save session setiap 5 menit
        const saveInterval = setInterval(() => {
            store.writeToFile(`${dir}/store.json`);
            saveSessionsToFile();
        }, 5 * 60 * 1000);

        newSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                sessions.set(number, {
                    socket: newSock,
                    startTime: Date.now(),
                    store,
                    saveInterval
                });
                
                if (!isRestore && m) {
                    await m.reply('✅ Berhasil terhubung kembali!');
                }
                
                // Kirim pesan status ke nomor jadibot
                await newSock.sendMessage(number, {
                    text: `🤖 *BOT STATUS UPDATE*\n\n✅ Terhubung kembali\n⏰ Waktu: ${new Date().toLocaleString()}`
                }).catch(console.error);
                
            } else if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                clearInterval(saveInterval);
                
                if (shouldReconnect) {
                    console.log('Mencoba menghubungkan ulang...', { statusCode });
                    setTimeout(async () => {
                        try {
                            await startJadibot(number, dir, sock, m);
                        } catch (err) {
                            console.error('Reconnect error:', err);
                            setTimeout(async () => {
                                await startJadibot(number, dir, sock, m);
                            }, 10000);
                        }
                    }, 3000);
                } else {
                    cleanupSession(number, dir);
                    if (m) await m.reply('❌ Session invalid, silahkan buat ulang!');
                }
            }
        });

        // Tambahkan handler untuk monitoring status
        newSock.ev.on('messages.upsert', async (m) => {
            if (m.messages[0].key.remoteJid === number) {
                const msg = m.messages[0];
                if (msg.message?.conversation === '.status') {
                    const session = sessions.get(number);
                    const uptime = session ? Date.now() - session.startTime : 0;
                    await newSock.sendMessage(number, {
                        text: `🤖 *STATUS BOT*\n\n⏱️ Uptime: ${formatUptime(uptime)}\n📱 Nomor: ${number.split('@')[0]}\n🔄 Koneksi: Aktif`
                    });
                }
            }
        });

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
    if (session?.saveInterval) {
        clearInterval(session.saveInterval);
    }
    sessions.delete(number);
    saveSessionsToFile();
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

export const handler = 'jadibot';
export const tags = ['owner'];
export const command = ['jadibot'];
export const help = 'Jadikan nomor lain sebagai bot (Owner Only)';

export { loadSavedSessions };
