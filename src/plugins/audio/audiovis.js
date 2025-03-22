import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = ["audiovis", "av"];
export const description = "🎵 Visualisasi audio (pilih style: 1-3)\n*.av 1* = wave\n*.av 2* = bars\n*.av 3* = spectrum";

export default async ({ sock, m, id, psn, sender, noTel, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: "🎵 Kirim atau reply audio/voice note dengan caption:\n\n*.av 1* = gelombang\n*.av 2* = batang\n*.av 3* = spektrum"
        });
        return;
    }

    let style = "1";
    if (psn && ["1", "2", "3"].includes(psn.trim())) {
        style = psn.trim();
    }

    await sock.sendMessage(id, { text: '🎨 Bentar ya bestie... ⏳' });

    try {
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const timestamp = Date.now();
        const inputFile = path.join(tempDir, `input_${timestamp}.mp3`);
        const outputFile = path.join(tempDir, `output_${timestamp}.mp4`);
        
        fs.writeFileSync(inputFile, attf);

        // Optimasi untuk ukuran file lebih kecil
        const resolution = "480x270"; // Resolusi lebih kecil
        const baseFilters = `scale=${resolution},format=yuv420p`; // Format scaling
        const videoCodecSettings = "-c:v libx264 -preset ultrafast -crf 28 -maxrate 800k -bufsize 1600k"; // Kompresi video
        const audioCodecSettings = "-c:a aac -b:a 96k"; // Kompresi audio

        let ffmpegCommand;
        switch (style) {
            case "1": // Wave - Paling ringan
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=${resolution}:mode=line:rate=15:colors=white[wave];[wave]${baseFilters}[v]" -map "[v]" -map 0:a ${videoCodecSettings} ${audioCodecSettings} -r 15 -g 30 -shortest -y "${outputFile}"`;
                break;
                
            case "2": // Bars
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=${resolution}:mode=cline:rate=15:colors=white[wave];[wave]${baseFilters}[v]" -map "[v]" -map 0:a ${videoCodecSettings} ${audioCodecSettings} -r 15 -g 30 -shortest -y "${outputFile}"`;
                break;
                
            case "3": // Spectrum
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showspectrum=s=${resolution}:mode=combined:color=rainbow:scale=log:slide=scroll:fps=15[spectrum];[spectrum]${baseFilters}[v]" -map "[v]" -map 0:a ${videoCodecSettings} ${audioCodecSettings} -r 15 -g 30 -shortest -y "${outputFile}"`;
                break;
        }

        // Jalankan FFmpeg
        const { stdout, stderr } = await execAsync(ffmpegCommand);
        console.log('FFmpeg Output:', stdout);
        console.log('FFmpeg Error:', stderr);

        // Verifikasi file output
        if (!fs.existsSync(outputFile)) {
            throw new Error('Output file not created');
        }

        const videoBuffer = fs.readFileSync(outputFile);
        const fileSize = videoBuffer.length / (1024 * 1024); // Size in MB
        
        const styleNames = {
            "1": "Wave",
            "2": "Bars",
            "3": "Spectrum"
        };

        // Kirim video
        await sock.sendMessage(id, {
            video: videoBuffer,
            caption: `✨ Visualisasi ${styleNames[style]} (${fileSize.toFixed(2)}MB) 🎵`,
            mimetype: 'video/mp4',
            gifPlayback: false,
        }, { 
            quoted:m,
            mediaUploadTimeoutMs: 1000 * 60
        });

        // Cleanup
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);

    } catch (error) {
        console.error("Error:", error);
        await sock.sendMessage(id, { 
            text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏" 
        });
    }
}; 