import { meta } from "../../lib/downloader.js";
export const description = "Downloader Facebook Reels provided by *Roidev*";
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
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
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
        let result = await meta(psn);
        if (Array.isArray(result)) {
            result.forEach(async (res) => {
                await sock.sendMessage(id, { video: { url: res.url }, caption: '🎥 *Video berhasil diunduh!*' });
            });
            return;
        } else {
            await sock.sendMessage(id, { video: { url: result.url }, caption: '🎥 *Video berhasil diunduh!*' });
        }

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
