import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import yts from "yt-search";

const execAsync = promisify(exec);

export const ytsearch = async (query) => {
    const res = await yts(query);
    return res.videos.map((video, index) => ({
        image: video.image || video.thumbnail,
        author: video.author.name,
        title: video.title,
        url: video.url
    }));
}

export const ytPlay = async (query) => {
    try {
        const { url, title } = (await ytsearch(query))[0];
        const outputPath = `./temp/${Date.now()}.mp3`;
        
        // Download dengan youtube-dl
        await execAsync(`yt-dlp -f bestaudio -o "${outputPath}.%(ext)s" ${url}`);
        
        // Convert ke MP3 dengan ffmpeg
        await execAsync(`ffmpeg -i "${outputPath}.webm" -codec:a libmp3lame -qscale:a 2 "${outputPath}"`);

        const audio = fs.readFileSync(outputPath);
        
        // Hapus file temporary
        fs.unlinkSync(`${outputPath}.webm`);
        fs.unlinkSync(outputPath);

        return {
            title,
            audio,
            thumbnail: `https://i.ytimg.com/vi/${url.split('v=')[1]}/hqdefault.jpg`,
            channel: (await yts({ videoId: url.split('v=')[1] })).author.name
        };

    } catch (error) {
        console.error('Error in ytPlay:', error);
        throw error;
    }
}

export const ytPlayVideo = async (query) => {
    try {
        const { url, title } = (await ytsearch(query))[0];
        const outputPath = `./temp/${Date.now()}.mp4`;
        
        // Download video dengan youtube-dl
        await execAsync(`youtube-dl -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" -o "${outputPath}" ${url}`);

        const video = fs.readFileSync(outputPath);
        
        // Hapus file temporary
        fs.unlinkSync(outputPath);

        return {
            title,
            video,
            thumbnail: `https://i.ytimg.com/vi/${url.split('v=')[1]}/hqdefault.jpg`,
            channel: (await yts({ videoId: url.split('v=')[1] })).author.name
        };

    } catch (error) {
        console.error('Error in ytPlayVideo:', error);
        throw error;
    }
}
