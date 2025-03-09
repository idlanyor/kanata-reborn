import { ig } from "../../lib/downloader.js";

export const description = "Downloader Instagram Video provided by *Roy*";
export const handler = "igv";

export default async ({ sock, m, id, psn }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`igv <url>`\n\nContoh:\n`igv https://www.instagram.com/reels/CMd5Hr5Dx-7/?igshid=1jg9b5j7qk7t7`'
        });
        return;
    }

    try {
        await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });
        const result = await ig(psn);

        if (Array.isArray(result)) {
            for (const res of result) {
                if (res.imageUrl) {
                    await sock.sendMessage(id, {
                        image: { url: res.imageUrl },
                        caption: '🖼️ *Gambar berhasil diunduh!*'
                    });
                }
                if (res.videoUrl) {
                    await sock.sendMessage(id, {
                        video: { url: res.videoUrl },
                        caption: '🎥 *Video berhasil diunduh!*'
                    });
                }
            }
            return;
        }

        if (result.imageUrl) {
            await sock.sendMessage(id, {
                image: { url: result.imageUrl },
                caption: '🖼️ *Gambar berhasil diunduh!*'
            });
        }
        if (result.videoUrl) {
            await sock.sendMessage(id, {
                video: { url: result.videoUrl },
                caption: '🎥 *Video berhasil diunduh!*'
            });
        }

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ *Terjadi kesalahan:* \n' + error.message
        });
    }
};
