import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const OUTPUT_DIR = 'public/downloads';

export const ytMp3 = async (url) => {
    try {
        // Generate a unique filename using timestamp
        const timestamp = Date.now();
        const outputTemplate = path.join(OUTPUT_DIR, `%(title)s-${timestamp}.%(ext)s`);
        
        // Add -v flag for verbose output
        const command = `yt-dlp -v --extract-audio --audio-format mp3 --output "${outputTemplate}" ${url}`;

        const { stdout, stderr } = await execAsync(command);
        console.log('stdout:', stdout); // For debugging

        // Look for the converted output file in the stdout
        const filenameMatch = stdout.match(/\[ExtractAudio\] Destination: (.+\.mp3)/i) || 
                             stdout.match(/\[ffmpeg\] Destination: (.+\.mp3)/i) ||
                             stdout.match(/Moving (.+\.mp3) to /i);

        if (!filenameMatch) {
            // Try to find any .mp3 file mentioned in the output
            const mp3Match = stdout.match(/[^\s]+\.mp3/);
            if (!mp3Match) {
                throw new Error('Could not extract filename from output');
            }
            return {
                success: true,
                message: 'Audio extracted successfully',
                filename: path.basename(mp3Match[0]),
                downloadUrl: `/downloads/${path.basename(mp3Match[0])}`
            };
        }

        const filename = filenameMatch[1];
        const baseFilename = path.basename(filename);
        const downloadUrl = `/downloads/${baseFilename}`;

        return {
            success: true,
            message: 'Audio extracted successfully',
            filename: baseFilename,
            downloadUrl
        };
    } catch (error) {
        console.error('Full error:', error);
        throw new Error(`Failed to download: ${error.message}`);
    }
};