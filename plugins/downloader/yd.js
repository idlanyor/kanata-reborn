import { yutubVideo } from '../../lib/downloader.js';

export const description = "YouTube Video Downloader (URL Only)";
export const handler = "yd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: `📽️ *YouTube Video Downloader*\n\n` +
                  `*Cara Penggunaan:*\n` +
                  `- Ketik: yd <url youtube>\n\n` +
                  `*Contoh:*\n` +
                  `yd https://youtu.be/xxxxx\n\n` +
                  `*Fitur:*\n` +
                  `- Kualitas Video 720p\n` +
                  `- Support URL YouTube\n` +
                  `- Format MP4\n\n` +
                  `*Note:* Khusus untuk URL YouTube`
        });
        return;
    }

    if (!psn.match(/youtu/gi)) {
        await sock.sendMessage(id, { 
            text: `❌ *URL Tidak Valid*\n\nHanya menerima URL YouTube!` 
        });
        return;
    }

    try {
        // Kirim reaction mulai
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        await sock.sendMessage(id, { 
            text: `🎥 *Memproses Video*\n\n` +
                  `Link: ${psn}\n` +
                  `Status: Mengunduh...\n` +
                  `Estimasi: 2-5 menit tergantung durasi`
        });
        
        const result = await yutubVideo(psn);
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Kirim thumbnail dan info
        caption = `📽️ *YOUTUBE VIDEO DOWNLOADER*\n\n`;
        caption += `📝 *Judul:* ${result.title}\n`;
        caption += `👤 *Channel:* ${result.channel}\n`;
        caption += `🎥 *Kualitas:* 720p\n`;
        caption += `📁 *Format:* MP4\n`;
        caption += `\n⏳ _Video sedang dikirim..._`;

        await sock.sendMessage(id, {
            image: { url: result.thumbnail },
            caption
        });

        // Kirim video sebagai dokumen untuk menghindari kompresi
        await sock.sendMessage(id, {
            document: { url: result.video },
            mimetype: 'video/mp4',
            fileName: `${result.title}.mp4`
        }, { quoted: m });

        // Kirim reaction selesai
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                  `*Pesan Error:* ${error.message}\n\n` +
                  `*Solusi:*\n` +
                  `1. Pastikan URL YouTube valid\n` +
                  `2. Coba video dengan durasi lebih pendek\n` +
                  `3. Laporkan ke owner jika masih error`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
