import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export const description = "YouTube Audio Downloader provided by *Roy*";
export const handler = "ymd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '🎵 *Gunakan format:* \n\n`ymd <url>`\n\nContoh:\n`ymd https://youtu.be/7P8tR5cJXk0`'
        });
        return;
    }
    try {
        await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });
        
        const outputPath = `./temp/${Date.now()}.mp3`;
        
        // Download dengan youtube-dl
        await execAsync(`yt-dlp -f bestaudio -o "${outputPath}.%(ext)s" ${psn}`);
        
        // Convert ke MP3 dengan ffmpeg
        await execAsync(`ffmpeg -i "${outputPath}.webm" -codec:a libmp3lame -qscale:a 2 "${outputPath}"`);
        
        // Kirim file audio
        await sock.sendMessage(id, { 
            audio: fs.readFileSync(outputPath), 
            mimetype: 'audio/mpeg' 
        }, { quoted: m });
        
        // Hapus file temporary
        fs.unlinkSync(`${outputPath}.webm`);
        fs.unlinkSync(outputPath);
        
        sock.sendMessage(id, { react: { text: '✅', key: m.key } })
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error });
    }
};
