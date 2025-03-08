import axios from 'axios';
import { Buffer } from 'buffer';
import yts from 'yt-search';

// Fungsi untuk mengunduh video dengan retry
async function downloadWithRetry(url, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 60000, // 60 detik timeout
                maxContentLength: 100 * 1024 * 1024, // 100MB max
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            return Buffer.from(response.data);
        } catch (error) {
            console.error(`Percobaan ${i + 1} gagal:`, error.message);
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Tunggu 2 detik sebelum retry
        }
    }
    throw new Error(`Gagal mengunduh setelah ${maxRetries} percobaan: ${lastError.message}`);
}

export const description = 'Putar dan Download Video dari *YouTube*';
export const handler = "ypv"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, { text: '🎥 Masukkan judul video atau URL YouTube yang ingin diputar.' });
            return;
        }

        await sock.sendMessage(id, { text: '🔍 Sedang memproses... Mohon tunggu sebentar.' });

        // if (psn.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
        //     try {
        //         const { data } = await axios.get(`https://kanata.roidev.my.id/api/ytshorts?url=${psn}`);
                
        //         if (!data?.result?.videoSrc) {
        //             throw new Error('URL video tidak ditemukan');
        //         }

        //         const videoBuffer = await downloadWithRetry(data.result.videoSrc);
                
        //         await sock.sendMessage(id, {
        //             video: videoBuffer,
        //             mimetype: 'video/mp4',
        //             caption: '*YouTube Video Downloader*\n\n✅ Video berhasil diunduh!'
        //         }, { quoted: m });
        //     } catch (error) {
        //         console.error('Error saat mengunduh video:', error);
        //         await sock.sendMessage(id, { text: '❌ Gagal mengunduh video: ' + error.message });
        //     }
        // } else {
            try {
                const results = await yts(psn);
                if (!results?.videos?.length) {
                    throw new Error('Video tidak ditemukan di yt Search');
                }
                
                const video = results.videos[0];
                const uri = `https://kanata.roidev.my.id/api/ytvideo?url=${video.url}`
                const { data } = await axios.get(uri);
                console.log(uri)
                console.log(data.result)
                return
                if (!data?.result?.videoSrc) {
                    throw new Error('URL video tidak ditemukan di API');
                }

                const videoBuffer = await downloadWithRetry(data.result.videoSrc);
                
                const caption = '*Hasil Pencarian Video YouTube*\n' +
                    `\n📹 *Judul:* ${video.title}` +
                    `\n📺 *Channel:* ${video.author.name}` +
                    `\n⏱️ *Durasi:* ${video.duration.timestamp}` +
                    `\n👁️ *Views:* ${video.views.toLocaleString()}` +
                    `\n🔗 *URL:* ${video.url}`;

                await sock.sendMessage(id, {
                    video: videoBuffer,
                    caption
                }, { quoted: m });
            } catch (error) {
                console.error('Error saat mencari/mengunduh video:', error);
                await sock.sendMessage(id, { text: '❌ Gagal memproses video: ' + error.message });
            }
        // }
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ Ups, terjadi kesalahan: ' + error.message });
        throw error;
    }
};
