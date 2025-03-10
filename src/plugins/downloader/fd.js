import { fb } from "../../lib/downloader.js";
export const description = "Downloader Facebook Reels provided by *Roy*";
export const handler = "fd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '🔍 *Gunakan format:* \n\n`fd <url>`\n\nContoh:\n`fd https://www.facebook.com/reels/103607619647607/?itct=ig_story_broadcast`',
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Kanata Downloader',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '乂 Facebook Downloader 乂',
                    body: 'Download Video From Facebook',
                    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/600px-Facebook_f_logo_%282019%29.svg.png',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Processing...* Mohon tunggu sebentar...' });
        let result = await fb(psn);
        await sock.sendMessage(id, { video: { url: result }, caption: '🎥 *Video berhasil diunduh!*' });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
