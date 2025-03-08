import axios from "axios";
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
        let { data } = await axios.get('https://api.roidev.my.id/api/ytvideo', {
            params: {
                url: psn
            }
        });
        // console.log(data)
        // caption = '*🎬 Hasil Video YouTube:*'
        // caption += '\n📛 *Title:* ' + `*${result.title}*`;
        // caption += '\n📺 *Channel:* ' + `*${result.channel}*`;
        // console.log(data)
        // return
        await sock.sendMessage(id, {
            document: { url: data.result.videoSrc },
            mimetype: 'video/mp4',
            fileName: `YTDL by Kanata-${Math.floor(Math.random(2 * 5))}.mp4`
        }, { quoted: m });
        await m.react('success')
        // await sock.sendMessage(id, { video: { url: video } });
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
        throw error
    }
};
