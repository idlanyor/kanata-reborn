import ytSearch from 'yt-search';
import axios from 'axios';

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
            const { data } = await axios.get(`https://roy.sirandu.icu/api/ytshorts?url=${psn}`);

            caption = '*YouTube Video Downloader*';
            caption += `\n\n⏳ _Video sedang dikirim. Mohon bersabar..._`;

            await sock.sendMessage(id, {
                video: { url: data.result.videoSrc },
                mimetype: 'video/mp4',
                caption
            }, { quoted: m });
        } else {
            // Jika bukan URL, lakukan pencarian video
            const results = await ytSearch(psn);
            const result = results.videos[0]; // Ambil hasil pertama

            // Download video hasil pencarian
            console.log(result.url)
            const { data } = await axios.get(`https://roy.sirandu.icu/api/ytshorts?url=${result.url}`);
            // console.log(data)

            caption = '*Hasil Pencarian Video YouTube*';
            caption += `\n\n📹 *Judul:* ${result.title}`;
            caption += `\n📺 *Channel:* ${result.author.name}`;
            caption += `\n⏱️ *Durasi:* ${result.duration.timestamp}`;
            caption += `\n👁️ *Views:* ${result.views.toLocaleString()}`;
            caption += `\n🔗 *URL:* ${result.url}`;
            caption += `\n\n⏳ _Video sedang dikirim. Mohon bersabar..._`;

            await sock.sendMessage(id, {
                image: { url: result.thumbnail },
                caption
            });

            await sock.sendMessage(id, {
                video: { url: data.result.videoSrc },
                mimetype: 'video/mp4',
                caption: `*${result.title}*\n\nBerhasil diunduh menggunakan Kanata V3`
            }, { quoted: m });
        }

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ Ups, terjadi kesalahan: ' + error.message });
        throw error
    }
};
