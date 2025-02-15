import { checkOwner } from "../../helper/permission.js";

export const handler = 'upch';
export const description = 'Upload To Channel';

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!await checkOwner(sock, id, noTel)) return;
    if (!psn && !attf) return sock.sendMessage(id, { text: "Text atau media apa yang mau dikirim ke channel?" });

    let messageOptions = {};

    try {
        // Deteksi jenis media dari message
        if (m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            messageOptions.image = { url: attf };
            messageOptions.caption = psn || '';
            messageOptions.mimetype = 'image/jpeg';
        } 
        else if (m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
            messageOptions.video = { url: attf };
            messageOptions.caption = psn || '';
            messageOptions.mimetype = 'video/mp4';
        }
        else if (m.message?.audioMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            messageOptions.audio = { url: attf };
            messageOptions.mimetype = 'audio/mp4';
            messageOptions.ptt = true;
        }
        else {
            // Jika hanya teks
            messageOptions.text = psn;
        }

        // Tambahkan contextInfo untuk semua jenis pesan
        messageOptions.contextInfo = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: globalThis.newsLetterJid,
                serverMessageId: -1,
                newsletterName: 'Kanata-V2'
            },
            externalAdReply: {
                showAdAttribution: true,
                title: '乂 Kanata-V2 乂',
                body: m.pushName || sender,
                mediaType: 1,
                thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                renderLargerThumbnail: true
            }
        };

        // Kirim pesan ke channel
        await sock.sendMessage(globalThis.newsLetterJid, messageOptions);

        // Kirim konfirmasi
        await sock.sendMessage(id, { 
            text: "✅ Pesanmu telah dikirim ke channel!",
            contextInfo: {
                externalAdReply: {
                    title: '乂 Channel Update 乂',
                    body: 'Message sent successfully!',
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
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
        console.error('Error in UPCH:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan: ${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Upload Failed',
                    body: 'An error occurred while uploading',
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
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
