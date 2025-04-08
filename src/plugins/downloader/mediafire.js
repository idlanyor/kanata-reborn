import { mediafire } from '../../lib/scraper/mediafire.js';

export const description = "MediaFire Downloader";
export const handler = "mf"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: `📥 *MediaFire Downloader*\n\n` +
                `*Cara Penggunaan:*\n` +
                `- Ketik: mf <url mediafire>\n\n` +
                `*Contoh:*\n` +
                `mf https://www.mediafire.com/file/xxx\n\n` +
                `*Fitur:*\n` +
                `- Download file dari MediaFire\n` +
                `- Support berbagai format file\n\n`
        });
        return;
    }

    try {
        // Kirim reaction mulai
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        await sock.sendMessage(id, {
            text: `📥 *Memproses Download*\n\n` +
                `Link: ${psn}\n` +
                `Status: Mengunduh...\n`
        });

        const result = await mediafire(psn);

        if (!result.status) {
            throw new Error(result.error);
        }

        const { filename, filesize, downloadUrl } = result.data;

        // Kirim info file
        await sock.sendMessage(id, {
            text: `✅ *File Ditemukan*\n\n` +
                `📂 Nama: ${filename}\n` +
                `📊 Ukuran: ${filesize}\n` +
                `⏳ Sedang mengirim file...`
        });

        // Kirim file
        await sock.sendMessage(id, {
            document: { url: downloadUrl },
            fileName: filename,
            mimetype: 'application/octet-stream'
        }, { quoted: m });

        // Kirim reaction selesai
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *GAGAL MEMPROSES*\n\n` +
                `*Pesan Error:* ${error.message}\n\n` +
                `*Solusi:*\n` +
                `- Pastikan link MediaFire valid\n` +
                `- Coba beberapa saat lagi\n` +
                `- Laporkan ke owner jika masih error`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
