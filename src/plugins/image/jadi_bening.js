import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "jadibening"
export const description = "✨ Berikan gambar burikmu,dan biarkan Bot berimajinasi! 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ tunggu Bentar,Bot sedang berimajinasi` });
        try {
            const imageUrl = await uploadGambar2(attf);
            const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/imgreconstruction-v1?url=${imageUrl}&style=Photo%20variation`);
            await sock.sendMessage(id, {
                image: { url },
                caption: '📷 Image Reconstruction berhasil! 🎉'
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
    await sock.sendMessage(id, { text: 'Kirim atau balas gambar dengan caption *jadibening* untuk mengonversi gambar burik mu menjadi Anime.' });
};
