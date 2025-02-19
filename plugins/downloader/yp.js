import { yutubAudio } from '../../lib/downloader.js';

export const description = 'Putar dan Download Audio dari *YouTube*';
export const handler = "yp"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, {
                text: `🎵 *YouTube Audio Downloader*\n\n` +
                    `*Cara Penggunaan:*\n` +
                    `- Ketik: yp <judul lagu/url>\n\n` +
                    `*Contoh:*\n` +
                    `yp Alan Walker Faded\n` +
                    `yp https://youtu.be/xxxxx\n\n` +
                    `*Note:* Kualitas audio 128kbps`
            });
            return;
        }

        await sock.sendMessage(id, {
            text: `🔍 *Pencarian Dimulai*\n\n` +
                `Query: ${psn}\n` +
                `Status: Sedang mencari & memproses...`
        });

        let result = await yutubAudio(psn);

        if (result.error) {
            throw new Error(result.error);
        }

        caption = `🎵 *YOUTUBE AUDIO DOWNLOADER*\n\n`;
        caption += `📝 *Judul:* ${result.title}\n`;
        caption += `👤 *Channel:* ${result.channel}\n`;
        caption += `🔗 *Link:* ${psn}\n`;
        caption += `\n⏳ _Audio sedang dikirim, mohon tunggu..._`;

        // Kirim thumbnail dengan caption
        await sock.sendMessage(id, {
            image: { url: result.thumbnail },
            caption
        }, { quoted: m });

        // Kirim reaction processing
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        // Kirim audio
        await sock.sendMessage(id, {
            audio: { url: result.audio },
            mimetype: 'audio/mpeg',
            fileName: `${result.title}.mp3`
        }, { quoted: m });

        // Kirim reaction selesai
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                `*Pesan Error:* ${error.message}\n\n` +
                `*Solusi:*\n` +
                `1. Pastikan URL/Query valid\n` +
                `2. Coba video lain\n` +
                `3. Laporkan ke owner jika masih error`
        });
    }
};