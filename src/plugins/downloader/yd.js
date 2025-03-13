import { yutubVideo } from "../../lib/downloader.js";
export const description = "YouTube Video Downloader provided by *Roy*";
export const handler = "yd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`yd <url>`\n\nContoh:\n`yd https://www.youtube.com/watch?v=Ww4Ua`'
        });
        return;
    }
    try {
        await m.react('wait')
        const result = await yutubVideo(psn);

        if (result.error) {
            throw new Error(result.error);
        }

        await sock.sendMessage(id, {
            document: { url: result.video },
            mimetype: 'video/mp4',
            fileName: `${result.title}.mp4`
        }, { quoted: m });
        await m.react('success')
        // await sock.sendMessage(id, { video: { url: video } });
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
        throw error
    }
};
