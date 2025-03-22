import { hikaru } from "../../helper/hikaru.js";
import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "remini"
export const description = "✨ Remini: Ubah gambar burik menjadi HD! 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // Jika gambar dalam bentuk buffer
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ Bentar,gambar burikmu sedang diproses` });
        try {
            // Mengunggah gambar dan mengubah menjadi HD menggunakan API Remini
            const imageUrl = await uploadGambar2(attf);
            const { url } = await fetch('https://fastrestapis.fasturl.cloud/aiimage/imgenlarger?url=' + imageUrl);
            await sock.sendMessage(id, {
                image: { url },
                caption: '📷 HD Image berhasil! Gambar burikmu telah dikonversi ke kualitas HD 🎉'
            }, { quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } });

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
    // await sock.sendMessage(id, { text: 'Kirim atau balas gambar dengan caption *remini* untuk mengubahnya menjadi HD.' });
};
