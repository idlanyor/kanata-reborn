import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = ["ae2", "audioeffect2"];
export const description = `🎵 More audio effects:
*.ae2 8d* = 8D Audio
*.ae2 vaporwave* = vaporwave
*.ae2 earrape* = earrape
*.ae2 chipmunk* = chipmunk
*.ae2 vibrato* = vibrato
*.ae2 blown* = blown bass
*.ae2 deep* = deep voice`;

export default async ({ sock, m, id, psn, sender, noTel, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: description
        });
        return;
    }

    if (!psn) {
        await sock.sendMessage(id, {
            text: "🎵 Pilih efek yang mau dipakai ya bestie!\n\n" + description
        });
        return;
    }

    await sock.sendMessage(id, { text: '🎧 Bentar ya bestie, lagi proses... ⏳' });

    try {
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const timestamp = Date.now();
        const inputFile = path.join(tempDir, `input_${timestamp}.mp3`);
        const outputFile = path.join(tempDir, `output_${timestamp}.mp3`);
        
        fs.writeFileSync(inputFile, attf);

        let ffmpegCommand;
        let effectName;
        const effect = psn.toLowerCase().trim();

        switch (effect) {
            case '8d':
                // 8D Audio effect
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "apulsator=hz=0.125,stereotools=phaseinv=1:mode=lr>rr" -b:a 192k "${outputFile}"`;
                effectName = "8D Audio";
                break;

            case 'vaporwave':
                // Vaporwave effect
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "asetrate=44100*0.8,aresample=44100,atempo=0.8" -b:a 192k "${outputFile}"`;
                effectName = "Vaporwave";
                break;

            case 'earrape':
                // Earrape effect (use with caution!)
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "acrusher=level_in=8:level_out=18:bits=8:mode=log:aa=1" -b:a 192k "${outputFile}"`;
                effectName = "Earrape";
                break;

            case 'chipmunk':
                // Chipmunk voice
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "asetrate=44100*1.4,aresample=44100,atempo=0.8" -b:a 192k "${outputFile}"`;
                effectName = "Chipmunk";
                break;

            case 'vibrato':
                // Vibrato effect
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "vibrato=f=6.5:d=0.5" -b:a 192k "${outputFile}"`;
                effectName = "Vibrato";
                break;

            case 'blown':
                // Blown/distorted bass
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "bass=g=25:frequency=40:width_type=h,dynaudnorm" -b:a 192k "${outputFile}"`;
                effectName = "Blown Bass";
                break;

            case 'deep':
                // Deep voice
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "asetrate=44100*0.8,aresample=44100,atempo=1.1" -b:a 192k "${outputFile}"`;
                effectName = "Deep Voice";
                break;

            default:
                await sock.sendMessage(id, {
                    text: "❌ Efek tidak tersedia!\n\n" + description
                });
                return;
        }

        // Jalankan FFmpeg
        await execAsync(ffmpegCommand);

        // Verifikasi file output
        if (!fs.existsSync(outputFile)) {
            throw new Error('Output file not created');
        }

        const audioBuffer = fs.readFileSync(outputFile);
        const fileSize = audioBuffer.length / (1024 * 1024); // Size in MB

        // Kirim audio
        await sock.sendMessage(id, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false, // Set true jika ingin dikirim sebagai voice note
            caption: `✨ ${effectName} Effect (${fileSize.toFixed(2)}MB) 🎵`
        }, { quoted:m });

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