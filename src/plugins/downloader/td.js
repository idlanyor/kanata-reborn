import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';
import { tiktokDl } from "../../lib/scraper/tiktok.js";


export const description = "Downloader TikTok provided by *Roy*";
export const handler = "td"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: "🎬 *Gunakan format:* \n\n`td <url>`\n\nContoh:\n`td https://vt.tiktok.com/ZSgQX6/`",
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Tiktok Downloader',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '乂 TikTok Downloader 乂',
                    body: 'Download TikTok Videos',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }
    try {
        sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })

        let { data } = await tiktokDl(psn);
        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `📹 *TIKTOK DOWNLOADER*\n\n` +
                    `📝 *Title:* ${data.caption}\n` +
                    `🔗 *URL:* ${psn}\n\n` +
                    `_Video sedang dikirim..._`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Downloader',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: 'TikTok Downloader',
                        body: data.caption,
                        thumbnailUrl: 'https://static.vecteezy.com/system/resources/thumbnails/016/716/485/small/tiktok-icon-free-png.png',
                        sourceUrl: psn,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id, quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        await sock.sendMessage(id, {
            video: { url: data.video[1].url },
            caption: `📹 *Video TikTok berhasil diunduh!*\n\n📄 *Title:* ${data.caption}`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '@newsletter',
                    newsletterName: data.author || 'Tiktok Downloader',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ *Terjadi kesalahan:* \n' + error.message,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: 'Tiktok Downloader',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '❌ Download Error',
                    body: 'An error occurred',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1
                }
            }
        });
    }
};
