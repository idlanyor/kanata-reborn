import { uploadGambar2 } from "../../helper/uploader.js";
import { removeBg } from "../../lib/mediaMsg/image.js";
export const handler = "removebg"
export const description = "✨ Ubah latar belakang gambar 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // Jika gambar dalam bentuk buffer
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ Bentar,gambarmu sedang diproses` });
        try {
            let response = await removeBg(attf, psn)
            const gambarBurik = await uploadGambar2(response)
            const { url } = await fetch('https://fastrestapis.fasturl.cloud/aiimage/imgenlarger?url=' + gambarBurik)
            await sock.sendMessage(m.key.remoteJid, {
                document: { url },
                mimetype: 'image/png',
                fileName: `KanataGhoib-${Math.floor(Math.random(2 * 5))}.png`
            }, { quoted: m });

        } catch (error) {
            // Penanganan kesalahan dengan pesan lebih informatif
            await sock.sendMessage(id, { text: `⚠️ Terjadi kesalahan saat memproses gambar. Coba lagi nanti ya!\n\nError: ${error.message}` });
        }
        return;
    }

    // Cek jika tidak ada gambar yang dikirim atau tidak dalam format yang benar
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return
    }
    await sock.sendMessage(id, { text: `Kirim atau balas gambar dengan caption *removebg* untuk mengubah latar belakang.\n ` });
};
