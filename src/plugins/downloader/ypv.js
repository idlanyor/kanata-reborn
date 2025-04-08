import axios from 'axios';
import yts from 'yt-search';

export const description = "YouTube Video Player";
export const handler = "ypv";

export default async ({ sock, m, id, psn, sender }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: `🎥 *YouTube Video Downloader*\n\n` +
                  `*Cara Penggunaan:*\n` +
                  `- Ketik: ypv <url video atau judul>\n` +
                  `- Untuk kualitas: ypv <url/judul> --360/--480/--720\n\n` +
                  `*Contoh:*\n` +
                  `ypv JKT48 Heavy Rotation --480\n\n` +
                  `*Fitur:*\n` +
                  `- Resolusi 360p/480p/720p\n` +
                  `- Format MP4\n` +
                  `- Proses Cepat`
        });
        return;
    }

    try {
        // Kirim reaction mulai
        await m.react('wait');
        
        // Extract quality flag if present
        let quality = '360' // default quality
        const qualityMatch = psn.match(/--(\d+)/)
        if (qualityMatch) {
            quality = qualityMatch[1]
            psn = psn.replace(/--\d+/, '').trim()
        }

        await sock.sendMessage(id, { 
            text: `🔄 *Memproses Video*\n\n` +
                  `Query: ${psn}\n` +
                  `Kualitas: ${quality}p\n` +
                  `Status: Mencari & Mengunduh...\n` +
                  `Estimasi: 1-2 menit`
        });

        let videoUrl;
        // Cek apakah input adalah URL YouTube
        if (psn.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
            videoUrl = psn;
        } else {
            // Jika bukan URL, cari video berdasarkan keyword
            const results = await yts(psn);
            if (!results?.videos.length) throw new Error('Video tidak ditemukan');
            videoUrl = results.videos[0].url;
        }

        // Get video from FastURL API
        const response = await axios.get(`https://fastrestapis.fasturl.cloud/downup/ytmp4`, {
            params: {
                url: videoUrl,
                quality: quality,
                server: 'server2'
            },
            headers: {
                'accept': 'application/json'
            }
        });

        const result = response.data.result;

        // Kirim info sebelum video
        await sock.sendMessage(id, { 
            text: `✅ *Video Siap Dikirim*\n\n` +
                  `📌 Judul: ${result.title}\n` +
                  `👤 Channel: ${result.author.name}\n` +
                  `⏱️ Durasi: ${result.metadata.duration}\n` +
                  `👁️ Views: ${result.metadata.views}\n` +
                  `📅 Upload: ${result.metadata.uploadDate}\n` +
                  `📺 Resolusi: ${result.quality}`
        });

        // Kirim video
        await sock.sendMessage(id, { 
            video: { url: result.media },
            mimetype: 'video/mp4',
            fileName: `${result.title}-${result.quality}.mp4`,
            caption: `${result.title} - ${result.quality}`
        }, { quoted: m });

        await m.react('success');

    } catch (error) {
        await m.react('error');
        await sock.sendMessage(id, { 
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                  `*Pesan Error:* ${error.message}\n\n` +
                  `*Solusi:*\n` +
                  `- Coba video lain\n` +
                  `- Pastikan URL/judul video benar\n` +
                  `- Coba kualitas video yang lebih rendah\n` +
                  `- Laporkan ke owner jika masih error`
        });
    }
};
