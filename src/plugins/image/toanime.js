import Pixnova from "../../lib/scraper/pixnova.js";
import { uploadGambar2 } from "../../helper/uploader.js";

export const handler = "toanime";
export const description = "✨ Convert gambarmu menjadi anime style menggunakan Pixnova AI! 📸";

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // Handle jika ada gambar yang langsung dikirim
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏳ Sedang mengkonversi gambar menjadi anime...` });
        try {
            // Simpan buffer ke file temporary
            const fileGambar = await uploadGambar2(attf)

            // Proses konversi dengan Pixnova
            const prompt = psn?.replace(handler, "").trim() || "Convert this image into an anime style resembling Ghibli";
            const converter = new Pixnova(prompt, fileGambar);
            const result = await converter.convert();

            if (!result.status) {
                return await sock.sendMessage(id, {
                    text: `❌ Gagal mengkonversi: ${result.message}`
                });
            }

            // Kirim hasil
            await sock.sendMessage(id, {
                image: { url: result.data.downloadUrl },
                caption: '✨ Berhasil mengkonversi gambar ke anime style\n' +
                    '📝 *Prompt:* ' + prompt + '\n' +
                    '👨‍💻 *By:* Roy~404~'
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(id, {
                text: `❌ Terjadi kesalahan: ${error.message}`
            });
        }
        return;
    } else {
        // return;
        await sock.sendMessage(id, {
            text: 'Kirim atau balas gambar dengan caption *toanime* untuk mengkonversi gambar menjadi Anime.\n\n' +
                'Contoh:\n' +
                '1. Kirim gambar dengan caption: *toanime*\n' +
                '2. Atau tambahkan prompt: *toanime make it look like ghibli style*'
        });
    }

    // Kirim petunjuk penggunaan

};
