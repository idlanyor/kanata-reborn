import { convertVideoToAudioBuffer } from "../../lib/mediaMsg/converter.js";

export const handler = 'tomp3'
export const description = 'Convert Video To Mp3'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        // if (!attf) return await sock.sendMessage(id, { text: "Tag/Kirim video yang mau dikonversi dengan caption tomp3" })
        let audio = await convertVideoToAudioBuffer(attf, 'mp3');
        await sock.sendMessage(m.key.remoteJid, { audio, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Error converting to MP3: ' + error.message });
        console.error('Error converting to MP3:', error);
    }
};
