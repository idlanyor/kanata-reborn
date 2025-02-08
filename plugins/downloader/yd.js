import axios from "axios";
export const description = "YouTube Video Downloader provided by *Roidev*";
export const handler = "yd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`yd <url>`\n\nContoh:\n`yd https://www.youtube.com/watch?v=Ww4Ua`'
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Processing...* Mohon tunggu sebentar...' });
        let { data } = await axios.get('https://roy.sirandu.icu/api/ytshorts', {
            params: {
                url: psn
            }
        });
        // caption = '*🎬 Hasil Video YouTube:*'
        // caption += '\n📛 *Title:* ' + `*${result.title}*`;
        // caption += '\n📺 *Channel:* ' + `*${result.channel}*`;
        await sock.sendMessage(id, {
            document: { url: data.videoSrc },
            mimetype: 'video/mp4',
            fileName: `YTDL by Kanata-${Math.floor(Math.random(2 * 5))}.mp4`
        }, { quoted: m });
        // await sock.sendMessage(id, { video: { url: video } });
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
