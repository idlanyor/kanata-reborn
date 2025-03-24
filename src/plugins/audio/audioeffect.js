import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = ["ae", "audioeffect"];
export const description = `🎵 Audio effects:
*.ae nc* = nightcore
*.ae bass* = bass boosted
*.ae robot* = robot voice
*.ae slow* = slow motion
*.ae fast* = fast motion
*.ae reverb* = reverb effect
*.ae echo* = echo effect`;

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
            case 'nc':
            case 'nightcore':
                // Nightcore: Increased speed and pitch
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "asetrate=44100*1.25,aresample=44100,atempo=1" -b:a 192k "${outputFile}"`;
                effectName = "Nightcore";
                break;

            case 'bass':
            case 'bass boost':
                // Bass boost
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "bass=g=15:frequency=110:width_type=h" -b:a 192k "${outputFile}"`;
                effectName = "Bass Boosted";
                break;

            case 'robot':
                // Robot voice
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)',aresample=44100" -b:a 192k "${outputFile}"`;
                effectName = "Robot Voice";
                break;

            case 'slow':
                // Slow motion (0.75x speed)
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "atempo=0.75" -b:a 192k "${outputFile}"`;
                effectName = "Slow Motion";
                break;

            case 'fast':
                // Fast motion (1.5x speed)
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "atempo=1.5" -b:a 192k "${outputFile}"`;
                effectName = "Fast Motion";
                break;

            case 'reverb':
                // Reverb effect
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "aecho=0.8:0.9:1000:0.3" -b:a 192k "${outputFile}"`;
                effectName = "Reverb";
                break;

            case 'echo':
                // Echo effect
                ffmpegCommand = `ffmpeg -i "${inputFile}" -af "aecho=0.8:0.88:60:0.4" -b:a 192k "${outputFile}"`;
                effectName = "Echo";
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