import {
    makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} from '@fizzxydev/baileys-pro';
import pino from "pino";
import NodeCache from "node-cache";
import fs from 'fs-extra';
import { startBot } from "../../app.js";
import { logger } from './logger.js';
import qrcode from 'qrcode-terminal';

class Kanata {
    constructor(data, io = null) {
        this.phoneNumber = data.phoneNumber;
        this.sessionId = data.sessionId;
        this.useStore = data.useStore;
        this.io = io;
    }

    async start() {
        logger.showBanner();
        const loadingProgress = logger.progress.start('Initializing Kanata Bot...');

        try {
            const msgRetryCounterCache = new NodeCache();
            const useStore = this.useStore;

            // Configure loggers
            const MAIN_LOGGER = pino({
                timestamp: () => `,"time":"${new Date().toJSON()}"`,
            });
            const pLogger = MAIN_LOGGER.child({});
            pLogger.level = "silent";

            // Initialize store
            const store = useStore ? makeInMemoryStore({ logger: pLogger }) : undefined;
            if (store) {
                store.readFromFile(`store-${this.sessionId}.json`);
                setInterval(() => {
                    store.writeToFile(`store-${this.sessionId}.json`);
                }, 10000 * 6);
            }

            // Initialize authentication
            const P = pino({ level: "silent" });
            let { state, saveCreds } = await useMultiFileAuthState(this.sessionId);
            let { version, isLatest } = await fetchLatestBaileysVersion();

            logger.progress.stop(loadingProgress);
            logger.info(`Using Baileys version: ${version} (Latest: ${isLatest})`);

            // Create socket connection
            const sock = makeWASocket({
                version,
                markOnlineOnConnect: true,
                logger: P,
                printQRInTerminal: true,
                browser: Browsers.macOS("Safari"),
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P),
                },
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true,
                markOnlineOnConnect: true,
                msgRetryCounterCache,
                connectOptions: {
                    maxRetries: 5,
                    keepAlive: true,
                    connectTimeout: 30000,
                },
            });

            // Bind store and credentials
            store?.bind(sock.ev);
            sock.ev.on("creds.update", saveCreds);

            // Handle QR code
            if (!sock.authState.creds.registered) {
                logger.connection.connecting("Waiting for QR code scan...");
                this.io?.emit("broadcastMessage", "Waiting for QR code scan...");
            }

            // Handle QR code updates
            sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
                if (qr) {
                    logger.connection.connecting("QR Code received, please scan!");
                    // Generate QR code in terminal
                    qrcode.generate(qr, { small: true });
                    this.io?.emit("qr", qr);
                    this.io?.emit("broadcastMessage", "QR Code received, please scan!");
                }

                switch (connection) {
                    case "connecting":
                        logger.connection.connecting("Connecting to WhatsApp...");
                        this.io?.emit("broadcastMessage", "Connecting...");
                        break;

                    case "open":
                        logger.connection.connected("Socket Connected!");
                        this.io?.emit("broadcastMessage", "Socket Connected!");
                        break;

                    case "close":
                        logger.connection.disconnected("Connection lost, attempting to reconnect...");
                        this.io?.emit("broadcastMessage", "Connection lost, attempting to reconnect...");

                        const reason = lastDisconnect?.error?.output?.statusCode;
                        if (reason === DisconnectReason.loggedOut) {
                            logger.error("Invalid session, removing session and restarting...");
                            this.io?.emit("broadcastMessage", "Invalid session, restarting...");
                            await fs.remove(`./${this.sessionId}`);
                            logger.info(`Session ${this.sessionId} removed!`);
                            await startBot();
                        } else if (reason === DisconnectReason.badSession) {
                            logger.system("Bad session, restarting...");
                            this.io?.emit("broadcastMessage", "Bad session, restarting...");
                            // await fs.remove(`./${this.sessionId}`);
                            await startBot();
                        } else {
                            logger.system("Restarting connection...");
                            await startBot();
                        }
                        break;
                }
            });

            return sock;
        } catch (error) {
            logger.progress.stop(loadingProgress);
            logger.error("Failed to start Kanata Bot", error);
            throw error;
        }
    }
}

async function clearMessages(m) {
    try {
        if (!m) return;
        let data;
        const text = m.message?.conversation?.trim() || m.message?.extendedTextMessage?.text?.trim();
        if (!text) return m;

        if (m.key.remoteJid.endsWith("g.us")) {
            data = {
                chatsFrom: "group",
                remoteJid: m.key.remoteJid,
                participant: {
                    fromMe: m.key.fromMe,
                    number: m.key.participant,
                    pushName: m.pushName,
                    message: text,
                },
            };
        } else {
            data = {
                chatsFrom: "private",
                remoteJid: m.key.remoteJid,
                fromMe: m.key.fromMe,
                pushName: m.pushName,
                message: text,
            };
        }
        return data;
    } catch (err) {
        logger.error("Error clearing messages:", err);
        return m;
    }
}

const sanitizeBotId = botId => botId.split(":")[0] + "@s.whatsapp.net";

const getPpUrl = async (sock, noTel) => {
    try {
        return await sock.profilePictureUrl(noTel + "@s.whatsapp.net", "image");
    } catch {
        return globalThis.defaultProfilePic
    }
}

export { Kanata, clearMessages, sanitizeBotId, getPpUrl };