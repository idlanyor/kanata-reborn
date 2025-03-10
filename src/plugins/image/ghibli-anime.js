export const description = "🎨 *AI Image Generator* disediakan oleh *SkizoTech*";
export const handler = "ghibli"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong kak!\n\nContoh: *ghibli pemandangan alam* atau *ghibli sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });
        const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/generativeimage?prompt=${encodeURIComponent(psn)}&style=Studio-Ghibli&ratio=1%3A1'`);
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};
