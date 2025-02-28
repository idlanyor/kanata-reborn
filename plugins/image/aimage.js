export const description = "🎨 *AI Image Generator* disediakan oleh *SkizoTech*";
export const handler = "aimage"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong kak!\n\nContoh: *aimage pemandangan alam* atau *aimage sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });

        const { url } = await fetch(`https://fastrestapis.fasturl.link/aiimage/flux/diffusion?prompt=${psn}&width=1024&height=1024`);
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};

