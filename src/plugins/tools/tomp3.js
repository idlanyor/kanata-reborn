import { downloadMediaMessage } from "@fizzxydev/baileys-pro/lib/Utils/messages.js";
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { randomBytes } from 'crypto';
import fs from 'fs';
import { promisify } from 'util';
import { logger } from '../../helper/logger.js';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export const handler = 'tomp3'
export const description = 'Convert Video To Mp3'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const tempInputPath = `./temp/input-${randomBytes(4).toString('hex')}.mp4`;
    const tempOutputPath = `./temp/output-${randomBytes(4).toString('hex')}.mp3`;

    try {
        let videoBuffer;
        
        if (m.quoted) {
            // Jika ada quoted message, download dari quoted
            videoBuffer = await downloadMediaMessage(
                m.quoted,
                'buffer',
                {},
                {
                    reuploadRequest: m.waUploadToServer
                }
            );
        } else if (attf) {
            // Jika tidak ada quoted, gunakan attachment langsung
            videoBuffer = attf;
        } else {
            return await sock.sendMessage(id, { 
                text: "Tag/Kirim video yang mau dikonversi dengan caption !tomp3" 
            });
        }

        // Tulis buffer ke file sementara
        await writeFile(tempInputPath, videoBuffer);

        // Konversi menggunakan ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(tempOutputPath);
        });

        // Baca hasil konversi
        const audioBuffer = fs.readFileSync(tempOutputPath);

        // Kirim hasil
        await sock.sendMessage(m.key.remoteJid, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg' 
        }, { quoted:m });

    } catch (error) {
        logger.error('Error converting to MP3:', error);
        await sock.sendMessage(m.key.remoteJid, { 
            text: 'Gagal mengkonversi ke MP3. Silakan coba lagi.' 
        });
    } finally {
        // Bersihkan file sementara
        try {
            if (fs.existsSync(tempInputPath)) await unlink(tempInputPath);
            if (fs.existsSync(tempOutputPath)) await unlink(tempOutputPath);
        } catch (err) {
            logger.error('Error cleaning temp files:', err);
        }
    }
};
