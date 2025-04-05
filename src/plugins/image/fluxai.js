export const description = "🎨 *AI Image Generator* disediakan oleh *SkizoTech*";
export const handler = "flux"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong kak!\n\nContoh: *flux pemandangan alam* atau *flux sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });

        const { url } = await fetch(`https://fastrestapis.fasturl.cloud/aiimage/flux/model?prompt=${psn}&model=flux_1_schnell&size=1_1_HD&style=anime&color=vibrant&lighting=golden_hour&mode=image`);
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};
