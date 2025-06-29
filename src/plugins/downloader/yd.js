import axios from 'axios';

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

        // Call FastURL API
        const response = await axios.get(globalThis.hikaru.baseUrl + `downup/ytmp4`, {
            params: {
                url: psn,
                quality: quality,
                server: 'server2'
            },
            headers: {
                'accept': 'application/json',
                'x-api-key': globalThis.hikaru.apiKey
            }
        });

        const result = response.data.result;
        
        caption = '*🎬 Hasil Video YouTube:*'
        caption += '\n📛 *Title:* ' + `*${result.title}*`
        caption += '\n⏱️ *Duration:* ' + `*${result.metadata.duration}*`
        caption += '\n📺 *Quality:* ' + `*${result.quality}*`
        caption += '\n👁️ *Views:* ' + `*${result.metadata.views}*`
        caption += '\n📅 *Upload:* ' + `*${result.metadata.uploadDate}*`
        caption += '\n👤 *Channel:* ' + `*${result.author.name}*`
        
        await sock.sendMessage(id, {
            document: { url: result.media },
            mimetype: 'video/mp4',
            fileName: `${result.title}-${result.quality}.mp4`,
            caption: caption
        }, { quoted:m });

        await m.react('success')
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
        throw error
    }
};
