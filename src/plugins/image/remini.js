import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "remini"
export const description = "✨ Remini: Ubah gambar burik menjadi HD! 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ Bentar,gambar burikmu sedang diproses` });
        try {
            const imageUrl = await uploadGambar2(attf);
            const { url } = await fetch(globalThis.hikaru.baseUrl + `aiimage/upscale?imageUrl=${imageUrl}&resize=2`, {
                headers: {
                    'x-api-key': globalThis.hikaru.apiKey
                }
            }).then(res => res.json());
            await sock.sendMessage(id, {
                image: { url },
                caption: '📷 HD Image berhasil! Gambar burikmu telah dikonversi ke kualitas HD 🎉'
            }, { quoted:m });

        } catch (error) {
            await sock.sendMessage(id, { text: `⚠️ Terjadi kesalahan saat memproses gambar. Coba lagi nanti ya!\n\nError: ${error.message}` });
        }
        return;
    }
};
