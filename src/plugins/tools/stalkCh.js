import { unixToDate } from "../../helper/date.js";
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


export const handler = 'stalkch'
export const description = 'Retrieve Information from Channel/Newsletter'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Mohon masukkan link channel WhatsApp yang valid!',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Channel Stalker 乂',
                    body: 'Please provide a valid WhatsApp channel link',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    if (!psn.includes('whatsapp.com/channel/')) {
        await sock.sendMessage(id, {
            text: '❌ Link tidak valid! Pastikan menggunakan format https://whatsapp.com/channel/KODE',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Invalid Link',
                    body: 'Please check your channel link format',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        return;
    }

    try {
        const filterCode = psn.match(/channel\/([A-Za-z0-9]{20,24})/)?.[1]
        if (!filterCode) {
            await sock.sendMessage(id, {
                text: '❌ Kode channel tidak ditemukan dalam link!',
                contextInfo: {
                    externalAdReply: {
                        title: '❌ Invalid Code',
                        body: 'Channel code not found in the link',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                    }
                }
            });
            return;
        }

        const metadata = await sock.newsletterMetadata('invite', filterCode)

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *CHANNEL INFORMATION* 」
├ *ID:* ${metadata.id}
├ *Name:* ${metadata.name}
├ *Created:* ${unixToDate(metadata.creation_time)}
├ *Subscribers:* ${metadata.subscribers}
├ *Link:* https://whatsapp.com/channel/${metadata.invite}
│
├ *Description:* 
${metadata.description || '(No Description)'}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 ${metadata.name} 乂`,
                        body: `Channel Information`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: metadata.pictureUrl || 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: `https://whatsapp.com/channel/${metadata.invite}`
                    }
                }
            }
        }), { userJid: id, quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '✅',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Terjadi kesalahan saat mengambil informasi channel: ' + error.message,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Stalking Failed',
                    body: 'An error occurred while fetching channel info',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
};
