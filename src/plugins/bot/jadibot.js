import Bot from '../../database/models/Bot.js';
import { Browsers, makeWASocket, useMultiFileAuthState } from '@seaavey/baileys';
import { checkOwner } from '../../helper/permission.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const sessions = new Map();

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        // Cek apakah user adalah owner
        if (!await checkOwner(sock, id, noTel)) return;

        if (!psn) {
            await sock.sendMessage(id, {
                text: '❌ Format salah!\nContoh: !jadibot 628123456789'
            });
            return;
        }

        // Format nomor telepon
        let targetNumber = psn.replace(/[^0-9]/g, '');
        if (!targetNumber.startsWith('62')) {
            targetNumber = '62' + targetNumber;
        }
        targetNumber = targetNumber + '@s.whatsapp.net';

        // Cek apakah nomor yang dituju adalah owner
        if (targetNumber === noTel) {
            await sock.sendMessage(id, {
                text: '❌ Tidak bisa jadikan nomor owner sebagai bot!'
            });
            return;
        }

        // Cek apakah nomor valid
        try {
            const [result] = await sock.onWhatsApp(targetNumber);
            if (!result?.exists) {
                await sock.sendMessage(id, {
                    text: '❌ Nomor tidak terdaftar di WhatsApp!'
                });
                return;
            }
        } catch (error) {
            await sock.sendMessage(id, {
                text: '❌ Nomor tidak valid!'
            });
            return;
        }

        // Generate unique session ID
        const sessionId = crypto.randomBytes(16).toString('hex');
        const sessionDir = path.join(process.cwd(), 'jadibots', targetNumber.split('@')[0]);

        // Create session directory
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        await sock.sendMessage(id, {
            text: `⏳ Memulai session jadibot untuk nomor ${targetNumber.split('@')[0]}...`
        });

        // Initialize session
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const jadibotSock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            generateHighQualityLinkPreview: true,
            browser: Browsers.macOS('safari')
        });

        // Handle connection update
        jadibotSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                if (shouldReconnect) {
                    await sock.sendMessage(id, {
                        text: `⚠️ Koneksi terputus untuk nomor ${targetNumber.split('@')[0]}, mencoba menghubungkan kembali...`
                    });
                } else {
                    sessions.delete(sessionId);
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    await sock.sendMessage(id, {
                        text: `❌ Session berakhir untuk nomor ${targetNumber.split('@')[0]}`
                    });
                }
            }

            if (connection === 'open') {
                await Bot.createJadiBot(targetNumber, sessionId);
                sessions.set(sessionId, jadibotSock);

                // Notifikasi ke user yang request
                await sock.sendMessage(id, {
                    text: `✅ Berhasil terhubung ke nomor ${targetNumber.split('@')[0]}!\n\nInfo Device:\n${JSON.stringify(jadibotSock.user, null, 2)}`
                });

                // Notifikasi ke user yang jadi bot
                await sock.sendMessage(targetNumber, {
                    text: '🤖 Nomor kamu sekarang sudah menjadi bot!\nKetik !menu untuk melihat daftar perintah'
                });
            }
        });

        // Request pairing code
        if (!jadibotSock.authState.creds.registered) {
            const code = await jadibotSock.requestPairingCode(targetNumber.split('@')[0]);

            // Kirim kode ke user yang mau jadi bot
            await sock.sendMessage(targetNumber, {
                text: `🔑 Kode pairing kamu adalah: ${code}\n\nMasukkan kode ini di WhatsApp kamu:\n1. Buka WhatsApp\n2. Klik Perangkat Tertaut\n3. Klik Tautkan Perangkat\n4. Masukkan kode di atas`
            });

            // Kirim notifikasi ke user yang request
            await sock.sendMessage(id, {
                text: `✅ Kode pairing telah dikirim ke nomor ${targetNumber.split('@')[0]}\nSilakan cek chat pribadi bot!`
            });
        }

        // Save credentials on update
        jadibotSock.ev.on('creds.update', saveCreds);

        // Auto delete session after 24 hours
        setTimeout(async () => {
            if (sessions.has(sessionId)) {
                jadibotSock.logout();
                sessions.delete(sessionId);
                fs.rmSync(sessionDir, { recursive: true, force: true });

                // Notifikasi ke kedua user
                await sock.sendMessage(id, {
                    text: `⏰ Session jadibot untuk nomor ${targetNumber.split('@')[0]} telah berakhir (24 jam)`
                });
                await sock.sendMessage(targetNumber, {
                    text: '⏰ Session jadibot kamu telah berakhir (24 jam)'
                });
            }
        }, 24 * 60 * 60 * 1000);

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Error: ${error.message}`
        });
    }
};

export const handler = 'jadibot';
export const tags = ['owner'];
export const command = ['jadibot'];
export const help = 'Jadikan nomor lain sebagai bot (Owner Only)\nContoh: !jadibot 628123456789'; 