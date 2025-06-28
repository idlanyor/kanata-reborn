import { spotifyUrl } from "../../lib/neoxr/spotify.js";
export const description = "Spotify Downloader provided by *Kanata V3*";
export const handler = "spotify"

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { 
                text: '🎵 *Gunakan format:* \n\n`spotify <url>`\n\nContoh:\n`spotify https://open.spotify.com/track/2gcMYiZzzmzoF8PPAfL3IO?si=XGDKMzmmSJ2rHjvpE_Yuow`' 
            });
            return;
        }

        // Validasi link Spotify
        if (!psn.includes('open.spotify.com/track/')) {
            await sock.sendMessage(id, { 
                text: '❌ *Link tidak valid!*\n\nPastikan link yang dikirim adalah link Spotify yang valid.\n\nContoh link yang benar:\n`https://open.spotify.com/track/...`' 
            });
            return;
        }

        await m.react('🔍');
        await sock.sendMessage(id, { text: `🔄 *Sedang Memproses...* Mohon tunggu sebentar...` });

        const { thumbnail, title, audio, author } = await spotifyUrl(psn);

        await sock.sendMessage(id, {
            image: { url: thumbnail },
            caption: `🎵 *${title}*\n👤 ${author || 'YNTKTS'}\n\n_⏳ Mohon tunggu, audio sedang dikirim..._`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: author || 'YNTKTS',
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
        console.error('Error in spotify download:', error);
        await sock.sendMessage(id, {
            text: '❌ Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'
        });
        await m.react('❌');
    }
};
