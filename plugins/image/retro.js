import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "retro"
export const description = "✨  Filter ini bisa merubah gambarmu menjadi berwarna ! 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // Jika gambar dalam bentuk buffer
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ Bentar,bot sedang mewarnai gambar...` });
        try {
            // Mengunggah gambar dan mengubah menjadi HD menggunakan API retro
            const imageUrl = await uploadGambar2(attf);
            const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/imgcolorize?url=${imageUrl}`);
            await sock.sendMessage(id, {
                image: { url },
                caption: '📷 Retro Image berhasil 🎉'
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
    await sock.sendMessage(id, { text: 'Kirim atau balas gambar dengan caption *retro* untuk mengubahnya menjadi berwarna.' });
};
