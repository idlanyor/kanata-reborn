import { yutubAudio } from '../../lib/downloader.js';

export const description = "YouTube Player";
export const handler = "yp"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: `🎵 *YouTube Playlist Downloader*\n\n` +
                  `*Cara Penggunaan:*\n` +
                  `- Ketik: yp <url youtube playlist>\n\n` +
                  `*Contoh:*\n` +
                  `yp jkt48 sanjou\n\n` +
                  `*Fitur:*\n` +
                  `- Audio MP3 128kbps\n` +
                  `- Proses Cepat\n\n`
        });
        return;
    }

    try {
        // Kirim reaction mulai
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });
        
        await sock.sendMessage(id, { 
            text: ` *Memproses Audio*\n\n` +
                  `Query: ${psn}\n` +
                  `Status: Mengunduh & Converting...\n` +
                  `Estimasi: 1-2 menit`
        });

        const result = await yutubAudio(psn);
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Kirim info sebelum audio
        await sock.sendMessage(id, { 
            text: `✅ *Audio Siap Dikirim*\n\n` +
                  `📝 Judul: ${result.title}\n` +
                  `👤 Channel: ${result.channel}\n` +
                  `🎵 Format: MP3\n` +
                  `🔊 Bitrate: 128kbps`
        });

        // Kirim audio
        await sock.sendMessage(id, { 
            audio: { url: result.audio }, 
            mimetype: 'audio/mpeg',
            fileName: `${result.title}.mp3`
        }, { quoted:m });
        
        // Kirim reaction selesai
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                  `*Pesan Error:* ${error.message}\n\n` +
                  `*Solusi:*\n` +
                  `- Coba playlist lain\n` +
                  `- Laporkan ke owner jika masih error`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
