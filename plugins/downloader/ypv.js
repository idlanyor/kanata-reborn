import { ytShorts } from '../../lib/scraper/yt-shorts.js';
import { ytsearch } from '../../lib/youtube.js';

export const description = 'Putar dan Download Video dari *YouTube*';
export const handler = "ypv"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, { text: '🎥 Masukkan judul video atau URL YouTube yang ingin diputar.' });
            return;
        }

        await sock.sendMessage(id, { text: '🔍 Sedang memproses... Mohon tunggu sebentar.' });

        // Cek apakah input adalah URL YouTube
        if (psn.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
            const result = await ytShorts(psn);
            caption = '*YouTube Video Downloader*';
            caption += `\n\n⏳ _Video sedang dikirim. Mohon bersabar..._`;

            await sock.sendMessage(id, { 
                video: { url: result.videoSrc }, 
                mimetype: 'video/mp4', 
                caption
            }, { quoted: m });
        } else {
            // Jika bukan URL, lakukan pencarian video
            const videos = await ytsearch(psn);
            const result = videos[0]; // Ambil hasil pertama

            // Download video hasil pencarian menggunakan ytShorts
            const videoResult = await ytShorts(result.url);
            
            caption = '*Hasil Pencarian Video YouTube*';
            caption += `\n\n📹 *Judul:* ${result.title}`;
            caption += `\n📺 *Channel:* ${result.author}`;
            caption += `\n🔗 *URL:* ${result.url}`;
            caption += `\n\n⏳ _Video sedang dikirim. Mohon bersabar..._`;

            await sock.sendMessage(id, {
                image: { url: result.image },
                caption
            });

            await sock.sendMessage(id, {
                video: { url: videoResult.videoSrc },
                mimetype: 'video/mp4',
                caption: `*${result.title}*\n\nBerhasil diunduh menggunakan Kanata V3`
            }, { quoted: m });
        }

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ Ups, terjadi kesalahan: ' + error.message });
    }
};
