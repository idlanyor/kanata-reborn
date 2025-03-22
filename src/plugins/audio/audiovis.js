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

        // Pilih command berdasarkan style
        let ffmpegCommand;
        switch (style) {
            case "1": // Wave - Paling ringan
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=640x360:mode=line:rate=20:colors=white[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -crf 30 -c:a copy -shortest -y "${outputFile}"`;
                break;
                
            case "2": // Bars - Menengah
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showwaves=s=640x360:mode=cline:rate=20:colors=white[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -crf 30 -c:a copy -shortest -y "${outputFile}"`;
                break;
                
            case "3": // Circle - Paling keren tapi tetap ringan
                ffmpegCommand = `ffmpeg -i "${inputFile}" -filter_complex "[0:a]showcqt=size=640x360:count=1:rate=20:bar_g=2:sono_g=4:bar_v=9:sono_v=13:sono_h=0:tc=0.33:tlength=1:toffset=0:font=mono:fontcolor=white:axis_h=0:count=1:csp=bt709:fps=20[v]" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -crf 30 -c:a copy -shortest -y "${outputFile}"`;
                break;
        }

        // Jalankan FFmpeg
        await execAsync(ffmpegCommand);

        // Baca dan kirim hasilnya
        const videoBuffer = fs.readFileSync(outputFile);
        
        const styleNames = {
            "1": "Wave Style",
            "2": "Bars Style",
            "3": "Circle Style"
        };

        await sock.sendMessage(id, {
            video: videoBuffer,
            caption: `✨ Visualisasi audio (${styleNames[style]}) 🎵`,
            mimetype: 'video/mp4'
        }, { quoted: m });

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