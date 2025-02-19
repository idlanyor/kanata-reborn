import pkg from '@seaavey/baileys';
import { checkOwner } from '../../helper/permission.js';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = 'upsw';
export const description = 'Upload status WhatsApp';

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!await checkOwner(sock, id, noTel)) return;
    if (!psn && !attf) {
        await sock.sendMessage(id, {
            text: "⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.upsw <caption>*\n\n📌 Contoh:\n*.upsw Hello World* (dengan media)",
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Kanata Status',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '乂 Status Uploader 乂',
                    body: 'Upload WhatsApp Status',
                    thumbnailUrl: 'https://s6.imgcdn.dev/YYoFZh.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    try {
        let messageOptions = {};

        // Deteksi jenis media dari message
        if (m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            messageOptions.image = attf;
            messageOptions.caption = psn || '';
            messageOptions.mimetype = 'image/jpeg';
        }
        else if (m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
            messageOptions.video = attf;
            messageOptions.caption = psn || '';
            messageOptions.mimetype = 'video/mp4';
        }
        else if (m.message?.audioMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            messageOptions.audio = attf;
            messageOptions.mimetype = 'audio/mp4';
            messageOptions.ptt = true;
        }
        else {
            messageOptions.text = psn;
        }

        // Tambahkan contextInfo untuk semua jenis pesan
        messageOptions.contextInfo = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363305152329358@newsletter',
                newsletterName: 'Kanata Status',
                serverMessageId: -1
            },
            externalAdReply: {
                showAdAttribution: true,
                title: '乂 Kanata Status 乂',
                body: m.pushName || sender,
                mediaType: 1,
                thumbnailUrl: 'https://s6.imgcdn.dev/YYoFZh.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                renderLargerThumbnail: true
            }
        };

        // Upload ke status
        await sock.sendMessage('status@broadcast', messageOptions);

        // Kirim konfirmasi
        await sock.sendMessage(id, {
            text: "✅ Status berhasil diupload!",
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Kanata Status',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '✅ Status Uploaded',
                    body: 'Status successfully uploaded!',
                    thumbnailUrl: 'https://s6.imgcdn.dev/YYoFZh.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '✅',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:* \n${error.message}`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Kanata Status',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '❌ Upload Failed',
                    body: 'An error occurred while uploading status',
                    thumbnailUrl: 'https://s6.imgcdn.dev/YYoFZh.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1
                }
            }
        });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
}; 