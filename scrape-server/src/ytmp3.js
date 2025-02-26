import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const OUTPUT_DIR = 'public/downloads'; // Make sure this directory exists

export const ytMp3 = async (url) => {
    try {
        const outputTemplate = path.join(OUTPUT_DIR, '%(title)s.%(ext)s');
        const command = `yt-dlp --extract-audio --audio-format mp3 --output "${outputTemplate}" ${url}`;

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            throw new Error(`yt-dlp error: ${stderr}`);
        }

        // Extract filename from stdout
        const filename = stdout.match(/\[ExtractAudio\] Destination: (.+\.mp3)/)?.[1];
        if (!filename) {
            throw new Error('Could not extract filename from output');
        }

        const baseFilename = path.basename(filename);
        const downloadUrl = `/downloads/${baseFilename}`;

        return {
            success: true,
            message: 'Audio extracted successfully',
            filename: baseFilename,
            downloadUrl
        };
    } catch (error) {
        throw new Error(`Failed to download: ${error.message}`);
    }
};