import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = ["audiovis", "av"];
export const description = "🎵 Visualisasi audio cepat (pilih style: 1-3)\n*.av 1* = wave\n*.av 2* = bars\n*.av 3* = circle";

export default async ({ sock, m, id, psn, sender, noTel, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: "🎵 Kirim atau reply audio/voice note dengan caption:\n\n*.av 1* = gelombang\n*.av 2* = batang\n*.av 3* = lingkaran"
        });
        return;
    }

    // Default style adalah 1 (wave)
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

        // Pilih command berdasarkan style dengan perbaikan format video
        let ffmpegCommand;
        const baseFilters = "scale=640:360,format=yuv420p"; // Memastikan format video kompatibel

        switch (style) {
            case "1": // Wave
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=640x360:mode=line:rate=25:colors=white[wave];[wave]${baseFilters}[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -pix_fmt yuv420p -r 25 -g 50 -c:a aac -b:a 128k -shortest -y "${outputFile}"`;
                break;
                
            case "2": // Bars
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=640x360:mode=cline:rate=25:colors=white[wave];[wave]${baseFilters}[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -pix_fmt yuv420p -r 25 -g 50 -c:a aac -b:a 128k -shortest -y "${outputFile}"`;
                break;
                
            case "3": // Circle
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showcqt=size=640x360:count=1:rate=25:bar_g=2:sono_g=4:bar_v=9:sono_v=13:sono_h=0:tc=0.33:tlength=1:toffset=0:font=mono:fontcolor=white:axis_h=0:count=1:csp=bt709:fps=25[cqt];[cqt]${baseFilters}[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -pix_fmt yuv420p -r 25 -g 50 -c:a aac -b:a 128k -shortest -y "${outputFile}"`;
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
        
        const styleNames = {
            "1": "Wave Style",
            "2": "Bars Style",
            "3": "Circle Style"
        };

        // Kirim video dengan parameter yang lebih lengkap
        await sock.sendMessage(id, {
            video: videoBuffer,
            caption: `✨ Visualisasi audio (${styleNames[style]}) 🎵`,
            mimetype: 'video/mp4',
            gifPlayback: false, // Pastikan tidak diputar sebagai GIF
            ptt: false, // Pastikan tidak diputar sebagai voice note
        }, { 
            quoted: m,
            mediaUploadTimeoutMs: 1000 * 60 // 60 detik timeout
        });

        // Cleanup
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);

    } catch (error) {
        console.error("Error in audio visualization:", error);
        
        let errorMessage = "⚠️ Waduh error nih bestie! ";
        
        if (error.message.includes('No such file')) {
            errorMessage += "File audionya bermasalah nih. Coba kirim ulang ya?";
        } else if (error.message.includes('Invalid data')) {
            errorMessage += "Format audionya gak didukung. Coba kirim MP3 atau voice note biasa ya?";
        } else if (error.message.includes('Output file not created')) {
            errorMessage += "Gagal bikin videonya nih. Coba style lain atau audio yang lebih pendek ya?";
        } else {
            errorMessage += "Coba lagi ntar ya? 🙏\n\nError: " + error.message;
        }

        await sock.sendMessage(id, { text: errorMessage });
    }
}; 