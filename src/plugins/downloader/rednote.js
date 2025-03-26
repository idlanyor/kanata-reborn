/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : RedNote (Xiaohongshu) Downloader
 * @module : ES6 Module
 */
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;
import { rednote } from '../../lib/scraper/rednote.js';

export const handler = 'rednote';
export const description = 'Download video from RedNote (Xiaohongshu)';

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: `⚠️ Silakan masukkan URL RedNote!\n\nContoh: !rednote http://xhslink.com/xxxxx`
        });
        return;
    }

    // Validasi URL RedNote
    if (!psn.match(/xhslink\.com\/[a-zA-Z0-9]+/)) {
        await sock.sendMessage(id, {
            text: '❌ URL RedNote tidak valid!'
        });
        return;
    }

    await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });

    try {
        await sock.sendMessage(id, {
            text: '⏳ Sedang memproses video...'
        });

        const { title, downloadUrl } = await rednote(psn);

        if (!downloadUrl) {
            throw new Error('Tidak dapat menemukan URL video');
        }

        // Buat pesan dengan format yang menarik
        const message = generateWAMessageFromContent(id, {
            extendedTextMessage: {
                text: `🎥 *REDNOTE DOWNLOADER*\n\n` +
                    `📝 *Judul:* ${title || 'Tidak ada judul'}\n` +
                    `🔗 *URL:* ${psn}\n\n` +
                    `_Sedang mengirim video..._`,
                contextInfo: {
                    externalAdReply: {
                        title: 'RedNote Downloader',
                        body: title || 'Download video RedNote',
                        thumbnailUrl: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029ValMR7jDp2Q7ldcaNK1L',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }, { quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        // Kirim video
        await sock.sendMessage(id, {
            video: {
                url: downloadUrl
            },
            caption: `🎥 *${title || 'RedNote Video'}*\n\n` +
                `_Downloaded by KanataV3_`,
            mimetype: 'video/mp4'
        }, { quoted:m });

        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('RedNote Error:', error);
        await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${error.message}\n\n` +
                `Pastikan URL valid dan video tersedia.`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
}; 