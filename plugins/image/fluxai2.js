export const description = "🎨 *AI Image Generator* disediakan oleh *SkizoTech*";
export const handler = "flux2"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong kak!\n\nContoh: *flux2 pemandangan alam* atau *flux2 sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });

        const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/flux2/style?prompt=${psn}&style=AI%20Dystopia`);
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};
