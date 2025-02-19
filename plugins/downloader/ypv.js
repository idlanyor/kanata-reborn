import { yutubVideo } from '../../lib/downloader.js';

export const description = 'Putar dan Download Video dari *YouTube*';
export const handler = "ypv"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, { 
                text: `🎥 *YouTube Video Downloader*\n\n` +
                      `*Cara Penggunaan:*\n` +
                      `- Ketik: ypv <judul video/url>\n\n` +
                      `*Contoh:*\n` +
                      `ypv Minecraft Gameplay\n` +
                      `ypv https://youtu.be/xxxxx\n\n` +
                      `*Note:* Max kualitas 720p`
            });
            return;
        }

        await sock.sendMessage(id, { 
            text: `🔍 *Pencarian Dimulai*\n\n` +
                  `Query: ${psn}\n` +
                  `Status: Sedang mencari & memproses...\n` +
                  `Estimasi: 1-3 menit tergantung durasi`
        });

        // Kirim reaction processing
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key }});

        let result = await yutubVideo(psn);
        
        if (result.error) {
            throw new Error(result.error);
        }

        caption = `📽️ *YOUTUBE VIDEO DOWNLOADER*\n\n`;
        caption += `📝 *Judul:* ${result.title}\n`;
        caption += `👤 *Channel:* ${result.channel}\n`;
        caption += `🎥 *Kualitas:* 720p\n`;
        caption += `🔗 *Link:* ${psn}\n`;
        caption += `\n⏳ _Video sedang dikirim, mohon tunggu..._`;

        await sock.sendMessage(id, { 
            video: { url: result.video }, 
            mimetype: 'video/mp4', 
            caption, 
            fileName: `${result.title}.mp4` 
        }, { quoted: m });

        // Kirim reaction selesai
        await sock.sendMessage(id, { react: { text: '✅', key: m.key }});

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                  `*Pesan Error:* ${error.message}\n\n` +
                  `*Solusi:*\n` +
                  `1. Pastikan URL/Query valid\n` +
                  `2. Coba video dengan durasi lebih pendek\n` +
                  `3. Laporkan ke owner jika masih error`
        });
    }
};
