import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

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

        // Generate random filename
        const randomName = Math.random().toString(36).substring(7);
        const outputPath = `./temp/${randomName}.mp4`;

        // Build simplified yt-dlp command
        const command = `yt-dlp -f "b[height<=${quality}]/w[height<=${quality}]" "${psn}" -o "${outputPath}" --no-warnings --no-playlist`;

        // Get basic info first
        const { stdout: info } = await execAsync(`yt-dlp -j "${psn}" --no-warnings --no-playlist`);
        const videoInfo = JSON.parse(info);

        // Download video
        await execAsync(command);
        
        caption = '*🎬 Hasil Video YouTube:*'
        caption += '\n📛 *Title:* ' + `*${videoInfo.title}*`
        caption += '\n⏱️ *Duration:* ' + `*${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}*`
        caption += '\n📺 *Quality:* ' + `*${quality}p*`
        
        await sock.sendMessage(id, {
            document: { url: outputPath },
            mimetype: 'video/mp4',
            fileName: `${videoInfo.title}-${quality}p.mp4`,
            caption: caption
        }, { quoted:m });
        
        // Clean up
        await execAsync(`rm "${outputPath}"`);
        
        await m.react('success')
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
        throw error
    }
};
