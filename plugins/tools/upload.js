import { uploadGambar2 } from "../../helper/uploader.js";
import pkg from '@seaavey/baileys';
const { proto, generateWAMessageFromContent } = pkg;
// import Button from "../../lib/button.js";

export const description = "📤 *Upload Image* 📤";
export const handler = ['tourl', "upload"]

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        try {
            const linkGambar = await uploadGambar2(attf);
            
            // Buat pesan dengan format yang lebih menarik
            const message = generateWAMessageFromContent(id, proto.Message.fromObject({
                extendedTextMessage: {
                    text: `*📤 UPLOAD BERHASIL!*\n\n` +
                          `🖼️ *Preview Gambar Berhasil Diupload*\n` +
                          `🔗 *Link:* ${linkGambar}\n\n` +
                          `📝 *Note:* Klik tombol Copy Link untuk menyalin URL\n` +
                          `atau gunakan tombol Visit Link untuk membuka gambar.\n\n` +
                          `_Powered by Kanata Bot_`,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 9999999,
                        externalAdReply: {
                            title: `乂 Image Uploader 乂`,
                            body: `Upload by: ${m.pushName || sender}`,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: linkGambar,
                            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                        },
                        mentionedJid: [m.sender]
                    }
                }
            }), { userJid: id });

            // Kirim pesan dengan template buttons
            await sock.sendMessage(id, {
                caption: message.message.extendedTextMessage.text,
                image: {
                    url: linkGambar,
                },
                footer: '© 2024 Kanata Bot • Created with ❤️ by Roy',
                templateButtons: [
                    {
                        index: 1,
                        urlButton: {
                            displayText: '🌐 Visit Link',
                            url: linkGambar
                        }
                    },
                    {
                        index: 2, 
                        quickReplyButton: {
                            displayText: '📋 Copy Link',
                            id: `copy_${linkGambar}`
                        }
                    }
                ],
                viewOnce: true,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    externalAdReply: {
                        title: '乂 Image Uploader 乂',
                        body: 'Click here to join our channel!',
                        thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 2,
                        renderLargerThumbnail: true
                    }
                }
            }, {
                quoted: m
            });

            // Kirim reaksi sukses
            await sock.sendMessage(id, { 
                react: { 
                    text: '✅', 
                    key: m.key 
                } 
            });

        } catch (error) {
            console.log('❌ Error creating gambar:', error);
            await sock.sendMessage(id, {
                text: `⚠️ *Terjadi Kesalahan!*\n\n` +
                      `🚨 *Error:* ${error.message}\n\n` +
                      `Silakan coba lagi nanti.`,
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
        return;
    }

    // Pesan jika tidak ada gambar
    await sock.sendMessage(id, {
        text: `⚠️ *Tidak ada gambar yang ditemukan!*\n\n` +
              `📝 *Cara penggunaan:*\n` +
              `• Kirim gambar dengan caption *!upload*\n` +
              `• Reply gambar dengan *!upload*\n\n` +
              `_Powered by Kanata Bot_`,
        contextInfo: {
            externalAdReply: {
                title: 'Image Uploader',
                body: 'Upload your images easily',
                thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                mediaType: 1,
            }
        }
    });
};
