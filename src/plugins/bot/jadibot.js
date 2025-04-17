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
        const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
        const logger = MAIN_LOGGER.child({});
        logger.level = "silent";

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        const store = makeInMemoryStore({ logger });
        store.readFromFile(`${sessionDir}/store.json`);
        setInterval(() => {
            store.writeToFile(`${sessionDir}/store.json`);
        }, 10000 * 6);

        const jadibotSock = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
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
            markOnlineOnConnect: true
        });

        store?.bind(jadibotSock.ev);
        jadibotSock.ev.on('creds.update', saveCreds);

        jadibotSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            console.log('[JADIBOT CONNECTION UPDATE]', update);
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

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    await m.reply('🔄 Koneksi terputus, mencoba menghubungkan kembali...');
                    startJadibot(targetNumber, sessionDir, sock, m);
                } else {
                    cleanupSession(targetNumber, sessionDir);
                    await m.reply('❌ Session invalid, silahkan buat ulang!');
                }
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

async function startJadibot(number, dir, sock, m) {
    try {
        const { state } = await useMultiFileAuthState(dir);
        const newSock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000
        });

        if (!sessions.has(number)) {
            sessions.set(number, {});
        }

        const session = sessions.get(number);
        session.socket = newSock;

        // Bind event handlers
        newSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                await m.reply('✅ Berhasil terhubung kembali!');
            }
        });

    } catch (error) {
        logger.error('Reconnect Error:', error);
        await m.reply('❌ Gagal menghubungkan kembali!');
    }
}


function cleanupSession(number, dir) {
    sessions.delete(number);
    fs.rmSync(dir, { recursive: true, force: true });
}

export const handler = 'jadibot';
export const tags = ['owner'];
export const command = ['jadibot'];
export const help = 'Jadikan nomor lain sebagai bot (Owner Only)';
