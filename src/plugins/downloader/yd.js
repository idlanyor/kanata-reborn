import { ytVideo2 } from "../../lib/scraper/ytmp4v2.js";
export const description = "YouTube Video Downloader provided by *Roy*";
export const handler = "yd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`yd <url>`\n\nContoh:\n`yd https://www.youtube.com/watch?v=Ww4Ua`\n\nKualitas video (opsional):\n`yd <url> --360` atau `--480` atau `--720`'
        });
        return;
    }

    try {
        await m.react('wait')
        
        // Extract quality flag if present
        let quality = '480' // default quality
        const qualityMatch = psn.match(/--(\d+)/)
        if (qualityMatch) {
            quality = qualityMatch[1]
            psn = psn.replace(/--\d+/, '').trim()
        }

        let { data } = await ytVideo2(psn)
        
        // Find matching quality video link
        let videoUrl = data.downloadLinks[0].url // default to first link
        const matchingQuality = data.downloadLinks.find(link => 
            link.quality === quality && (link.type === 'mp4' || link.type === 'mp4 dash')
        )
        if (matchingQuality) {
            videoUrl = matchingQuality.url
        }

        caption = '*🎬 Hasil Video YouTube:*'
        caption += '\n📛 *Title:* ' + `*${data.title}*`
        caption += '\n⏱️ *Duration:* ' + `*${data.duration}*`
        caption += '\n📺 *Quality:* ' + `*${quality}p*`
        
        await sock.sendMessage(id, {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${data.title}-${quality}p.mp4`,
            caption: caption
        }, { quoted:m });
        
        await m.react('success')
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
        throw error
    }
};
