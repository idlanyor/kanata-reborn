import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = "audiovis";
export const description = "🎵 Visualisasi audio menjadi video dengan gelombang suara yang keren!";

export default async ({ sock, m, id, psn, sender, noTel, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: "🎵 Kirim atau reply audio/voice note yang mau divisualisasikan ya bestie!\n\nContoh: *.audiovis*"
        });
        return;
    }

    await sock.sendMessage(id, { text: '🎨 Bentar ya bestie, lagi bikin visualisasinya... ⏳' });

    try {
        // Buat direktori temp jika belum ada
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate nama file unik
        const timestamp = Date.now();
        const inputFile = path.join(tempDir, `input_${timestamp}.mp3`);
        const outputFile = path.join(tempDir, `output_${timestamp}.mp4`);

        // Tulis buffer audio ke file
        fs.writeFileSync(inputFile, attf);

        // Command FFmpeg untuk membuat visualisasi
        const ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=1280x720:mode=line:rate=25:colors=cyan|blue,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -c:a aac -b:a 192k -shortest -y "${outputFile}"`;

        // Jalankan FFmpeg
        await execAsync(ffmpegCommand);

        // Baca file output
        const videoBuffer = fs.readFileSync(outputFile);

        // Kirim video
        await sock.sendMessage(id, {
            video: videoBuffer,
            caption: '✨ Ini visualisasi audionya bestie! Keren kan? 🎵',
            mimetype: 'video/mp4'
        }, { quoted: m });

        // Cleanup files
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);

    } catch (error) {
        console.error("Error in audio visualization:", error);
        
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