import { igDl } from "../../lib/scraper/igdl.js";

export const description = "✨ Downloader Instagram Video & Image provided by *Roy*";
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
        const result = await igDl(psn);

        if (!result?.status) {
            await sock.sendMessage(id, {
                text: `❌ *Gagal:* ${result?.message}`
            });
            return;
        }

        if (Array.isArray(result?.data)) {
            for (const item of result?.data) {
                if (item?.imageUrl) {
                    await sock.sendMessage(id, {
                        image: { url: item?.thumbnail },
                        caption: '🖼️ *Gambar berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
                    });
                }
                if (item?.videoUrl) {
                    await sock.sendMessage(id, {
                        video: { url: item?.videoUrl },
                        caption: '🎥 *Video berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
                    });
                }
            }
            return;
        }

        if (result?.data?.thumbnail) {
            await sock.sendMessage(id, {
                image: { url: result?.data?.thumbnail },
                caption: '🖼️ *Gambar berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
            });
        }
        if (result?.data?.videoUrl) {
            await sock.sendMessage(id, {
                video: { url: result?.data?.videoUrl },
                caption: '🎥 *Video berhasil diunduh!*\n\n👨‍💻 By: Roy~404~'
            });
        }

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ *Terjadi kesalahan:* \n' + error.message
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
