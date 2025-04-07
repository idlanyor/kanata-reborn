import axios from "axios";

export const description = "✨ Downloader Instagram Video & Image provided by *FastURL*";
export const handler = "ig";

export default async ({ sock, m, id, psn }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`ig <url>`\n\nContoh:\n`ig https://www.instagram.com/reel/DF4oOlavxSq/`'
        });
        return;
    }

    try {
        await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });

        const res = await axios.get(`https://fastrestapis.fasturl.cloud/downup/igdown?url=${encodeURIComponent(psn)}`, {
            headers: { accept: 'application/json' }
        });

        const result = res.data?.result;

        if (!result?.status || !result?.data?.length) {
            await sock.sendMessage(id, {
                text: `❌ *Gagal:* Tidak ada data ditemukan atau URL tidak valid.`
            });
            return;
        }

        for (const item of result.data) {
            if (item.thumbnail) {
                await sock.sendMessage(id, {
                    image: { url: item.thumbnail },
                    caption: '🖼️ *Gambar berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
                });
            }
            if (item.url) {
                await sock.sendMessage(id, {
                    video: { url: item.url },
                    caption: '🎥 *Video berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
        await sock.sendMessage(id, {
            text: '❌ *Terjadi kesalahan:* \n' + error.message
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
