export const description = "🎨 *AI Image Generator* disediakan oleh *FastURL*";
export const handler = "aimage2"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong kak!\n\nContoh: *aimage pemandangan alam* atau *aimage sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bot Sedang berimajinasi, tunggu bentar ya... ⏳' });

        const { url } = await fetch(globalThis.hikaru.baseUrl + `aiimage/flux/model?prompt=${psn}&model=flux_1_dev&size=1_1_HD&style=neon_punk&color=cool&lighting=dramatic&mode=image`, {
            headers: {
                'x-api-key': globalThis.hikaru.apiKey
            }
        }).then(res => res.json());
        await sock.sendMessage(id, { image: { url }, caption: `✨ Ini hasil gambar untuk query: _${psn}_` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ Maaf, terjadi kesalahan:\n\n${error.message}` });
    }
};

