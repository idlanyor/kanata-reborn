import { uploadGambar2 } from "../../helper/uploader.js";
import { sendIAMessage } from "../../helper/button.js";

export const description = "📤 *Upload Image* 📤";
export const handler = 'upload'

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        try {
            const linkGambar = await uploadGambar2(attf);

            const btns = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Copy Link',
                        copy_code: linkGambar,
                    }),
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Visit Link',
                        url: linkGambar,
                    }),
                }
            ];

            const messageContent = {
                viewOnceMessage: {
                    message: {
                        imageMessage: {
                            url: linkGambar,
                            caption: `*📤 UPLOAD BERHASIL!*\n\n` +
                                `🖼️ *Preview Gambar Berhasil Diupload*\n` +
                                `🔗 *Link:* ${linkGambar}\n\n` +
                                `📝 *Note:* Klik tombol Copy Link untuk menyalin URL\n` +
                                `atau gunakan tombol Visit Link untuk membuka gambar.\n\n` +
                                `_Powered by Kanata Bot_`,
                            mimetype: "image/jpeg",
                            jpegThumbnail: attf,
                        }
                    }
                }
            };

            await sendIAMessage(id, btns, m, {
                header: '乂 Image Uploader 乂',
                content: messageContent.viewOnceMessage.message.imageMessage.caption,
                footer: '© 2024 Kanata Bot • Created with ❤️ by Roy',
                media: linkGambar,
                mediaType: "image"
            }, sock);

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
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
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
                thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                mediaType: 1,
            }
        }
    });
};
