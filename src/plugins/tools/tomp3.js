import { convertVideoToAudioBuffer } from "../../lib/mediaMsg/converter.js";
import { downloadMediaMessage } from "@fizzxydev/baileys-pro/lib/Utils/messages.js";

export const handler = 'tomp3'
export const description = 'Convert Video To Mp3'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
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

        let audio = await convertVideoToAudioBuffer(videoBuffer, 'mp3');
        await sock.sendMessage(m.key.remoteJid, { 
            audio, 
            mimetype: 'audio/mpeg' 
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(m.key.remoteJid, { 
            text: 'Error converting to MP3: ' + error.message 
        });
        console.error('Error converting to MP3:', error);
    }
};
