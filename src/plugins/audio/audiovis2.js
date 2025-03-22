import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = "audiovis2";
export const description = "🎵 Visualisasi audio dengan spektrum warna-warni yang keren!";

export default async ({ sock, m, id, psn, sender, noTel, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: "🎵 Kirim atau reply audio/voice note yang mau divisualisasikan ya bestie!\n\nContoh: *.audiovis2*"
        });
        return;
    }

    await sock.sendMessage(id, { text: '🎨 Bentar ya bestie, lagi bikin visualisasi spektrumnya... ⏳' });

    try {
        // Buat direktori temp
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate nama file
        const timestamp = Date.now();
        const inputFile = path.join(tempDir, `input_${timestamp}.mp3`);
        const outputFile = path.join(tempDir, `output_${timestamp}.mp4`);

        // Tulis buffer audio
        fs.writeFileSync(inputFile, attf);

        // Command FFmpeg untuk spektrum yang lebih menarik
        const ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showspectrum=s=1280x720:mode=combined:color=rainbow:scale=cbrt:slide=scroll:saturation=4,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -shortest -y "${outputFile}"`;

        // Jalankan FFmpeg
        await execAsync(ffmpegCommand);

        // Baca hasil
        const videoBuffer = fs.readFileSync(outputFile);

        // Kirim video
        await sock.sendMessage(id, {
            video: videoBuffer,
            caption: '✨ Ini visualisasi spektrum audionya bestie! Makin keren kan? 🌈',
            mimetype: 'video/mp4'
        }, { quoted:m });

        // Cleanup
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);

    } catch (error) {
        console.error("Error in spectrum visualization:", error);
        
        let errorMessage = "⚠️ Waduh error nih bestie! ";
        
        if (error.message.includes('No such file')) {
            errorMessage += "File audionya bermasalah nih. Coba kirim ulang ya?";
        } else if (error.message.includes('Invalid data')) {
            errorMessage += "Format audionya gak didukung. Coba kirim MP3 atau voice note biasa ya?";
        } else if (error.message.includes('Permission denied')) {
            errorMessage += "Ada masalah akses file. Coba lagi ntar ya?";
        } else {
            errorMessage += "Coba lagi ntar ya? 🙏";
        }

        await sock.sendMessage(id, { text: errorMessage });
    }
}; 