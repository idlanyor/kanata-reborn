import { meta } from "../../lib/downloader.js";
export const description = "Downloader Instagram Video provided by *Roy*";
export const handler = "igv"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`igv <url>`\n\nContoh:\n`igv https://www.instagram.com/reels/CMd5Hr5Dx-7/?igshid=1jg9b5j7qk7t7`'
        });
        return;
    }
    try {
        sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
        let result = await meta(psn);
        if (Array.isArray(result)) {
            result.forEach(async (res) => {
                await sock.sendMessage(id, { video: { url: res.videoLink }, caption: '🎥 *Video berhasil diunduh!*' });
            });
            return;
        } else {
            await sock.sendMessage(id, { video: { url: result.videoLink }, caption: '🎥 *Video berhasil diunduh!*' });
        }

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
