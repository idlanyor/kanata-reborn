import { dalle3 } from "../../lib/ai.js";

/**
 * Deskripsi plugin
 */
export const description = "🎨 *AI Image Generator* disediakan oleh *FastURL*";

/**
 * Handler plugin
 */
export const handler = "aimage"


export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        // Pesan ketika query kosong
        await sock.sendMessage(id, {
            text: "🖼️ Kasih query gambarnya dong kak!\n\nContoh: *aimage pemandangan alam* atau *aimage sunset di pantai*"
        });
        return;
    }

    try {
        // Notifikasi proses sedang berlangsung
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });

        // Mengirimkan hasil gambar yang dihasilkan AI
        const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/flux/diffusion?prompt=${psn}&width=1024&height=1024`);
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        // Penanganan error dengan pesan yang lebih estetik
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};
