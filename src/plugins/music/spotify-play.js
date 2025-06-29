import { spotifySong } from "../../lib/neoxr/spotify.js";

export const handler = 'play'
export const description = 'Search Spotify Song/Artist'

export default async ({ sock, m, id, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: '🎵 Masukkan judul lagu yang ingin diputar atau dicari.' });
            return;
        }

        await m.react('🔍');
        await sock.sendMessage(id, { text: `🔍 Sedang mencari *${psn}* di Spotify...` });

        const { thumbnail, title, author, audio, cover } = await spotifySong(psn);
        // Kirim card dan info
        await sock.sendMessage(id, {
            image: { url: cover },
            caption: `🎵 *${title}*\n👤 ${author}\n\n_⏳ Mohon tunggu, audio sedang dikirim..._`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: author,
                    thumbnailUrl: thumbnail,
                    sourceUrl: 'https://open.spotify.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // Kirim audio
        await sock.sendMessage(id, {
            audio: { url: audio },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m });

        await m.react('✨');

    } catch (error) {
        console.error('Error in spotify play:', error);
        await sock.sendMessage(id, {
            text: '❌ Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'
        });
        await m.react('❌');
    }
};


