import { yutubVideo } from '../../lib/downloader.js';

export const description = "YouTube Video Player";
export const handler = "ypv";

export default async ({ sock, m, id, psn, sender }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: `🎥 *YouTube Video Downloader*\n\n` +
                  `*Cara Penggunaan:*\n` +
                  `- Ketik: yv <url video atau judul>\n\n` +
                  `*Contoh:*\n` +
                  `yv JKT48 Heavy Rotation\n\n` +
                  `*Fitur:*\n` +
                  `- Resolusi 480p\n` +
                  `- Format MP4\n` +
                  `- Proses Cepat`
        });
        return;
    }

    try {
        // Kirim reaction mulai
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });
        
        await sock.sendMessage(id, { 
            text: ` *Memproses Video*\n\n` +
                  `Query: ${psn}\n` +
                  `Status: Mengunduh & Encoding...\n` +
                  `Estimasi: 2-3 menit`
        });

        const result = await yutubVideo(psn);
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Kirim info sebelum video
        await sock.sendMessage(id, { 
            text: `✅ *Video Siap Dikirim*\n\n` +
                  `📌 Judul: ${result.title}\n` +
                  `👤 Channel: ${result.channel}\n` +
                  `📺 Resolusi: 480p\n` +
                  `🎞️ Format: MP4`
        });

        // Kirim video
        await sock.sendMessage(id, { 
            video: { url: result.video }, 
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
                  `- Coba video lain\n` +
                  `- Laporkan ke owner jika masih error`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
