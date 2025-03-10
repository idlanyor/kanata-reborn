import { beta } from "../../helper/betabotz.js";
import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "hd"
export const description = "✨ Berikan gambarmu burik mu untuk dirubah jadi bening 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ tunggu bentar,Gambar burikmu lagi diproses` });
        try {
            const imageUrl = await uploadGambar2(attf);
            const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/imgenlarger?url=${imageUrl}`);
            await sock.sendMessage(id, {
                image: { url },
                caption: '📷 HD Image berhasil, Gambar burikmu telah dikonversi ke kualitas HD 🎉'
            }, { quoted: m });
            return
        } catch (error) {
            console.log(error)
            await sock.sendMessage(id, { text: `⚠️ Terjadi kesalahan saat memproses gambar burik. Coba lagi nanti ya!\n\nError: ${error.message}` });
        }
        return;
    }

    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return
    }
    await sock.sendMessage(id, { text: 'Kirim atau balas gambar burik dengan caption *hd* untuk mengonversi gambar menjadi Kartun.' });
};
