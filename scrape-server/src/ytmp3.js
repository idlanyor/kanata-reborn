import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const ytMp3 = async (url) => {
    try {
        const outputTemplate = '%(title)s.%(ext)s';
        const command = `yt-dlp --extract-audio --audio-format mp3 --output "${outputTemplate}" ${url}`;

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            throw new Error(`yt-dlp error: ${stderr}`);
        }

        // Extract filename from stdout
        const filename = stdout.match(/\[ExtractAudio\] Destination: (.+\.mp3)/)?.[1];

        return {
            success: true,
            message: 'Audio extracted successfully',
            filename: filename || 'Untitled-Kanata.mp3'
        };
    } catch (error) {
        throw new Error(`Failed to download: ${error.message}`);
    }
};