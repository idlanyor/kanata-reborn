import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "jadianime2"
export const description = "✨ Berikan gambar burikmu,dan biarkan Bot berimajinasi! 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ tunggu Bentar,Bot sedang berimajinasi` });
        try {
            const imageUrl = await uploadGambar2(attf);
            let url = `https://fastrestapis.fasturl.cloud/aiimage/imgreconstruction-v1?url=${imageUrl}&style=Anime%20Colorful`
            const response = await fetch(url);
            await sock.sendMessage(id, {
                image: { url: response.url },
                caption: '📷 Image to Anime berhasil! 🎉'
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
};
