import { tiktokDl } from "../../lib/scraper/tiktok.js";
export const description = "Downloader TikTok Audio provided by *Roy*";
export const handler = "tmd"

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: "🎵 *Gunakan format:* \n\n`tmd <url>`\n\nContoh:\n`tmd https://vt.tiktok.com/ZSgQX6/`"
        });
        return;
    }
    try {
        sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })

        let { data } = await tiktokDl(psn);
        await sock.sendMessage(id, {
            audio: { url: data.audio },
            mimetype: 'audio/mpeg',
            // caption: '🎧 *Audio TikTok berhasil diunduh!*'
        });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
