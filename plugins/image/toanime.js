import Pixnova from "../../lib/scraper/pixnova.js";
import { join } from "path";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";

export const handler = "toanime";
export const description = "✨ Convert gambarmu menjadi anime style menggunakan Pixnova AI! 📸";

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // Handle jika ada gambar yang langsung dikirim
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏳ Sedang mengkonversi gambar menjadi anime...` });
        try {
            // Simpan buffer ke file temporary
            const tempFile = join(tmpdir(), `pixnova_${Date.now()}.jpg`);
            await writeFile(tempFile, attf);

            // Proses konversi dengan Pixnova
            const prompt = psn?.replace(handler, "").trim() || "Convert this image into an anime style resembling Ghibli";
            const converter = new Pixnova(prompt, tempFile);
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
    }

    // Handle jika tidak ada gambar yang dikirim
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return;
    }

    // Kirim petunjuk penggunaan
    await sock.sendMessage(id, {
        text: 'Kirim atau balas gambar dengan caption *toanime* untuk mengkonversi gambar menjadi Anime.\n\n' +
            'Contoh:\n' +
            '1. Kirim gambar dengan caption: *toanime*\n' +
            '2. Atau tambahkan prompt: *toanime make it look like ghibli style*'
    });
};
