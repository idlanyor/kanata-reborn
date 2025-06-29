import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


export const handler = 'gcstalk'
export const description = 'Retrieve GC Information by Invite Link'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Mohon masukkan link grup WhatsApp yang valid!',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Group Stalker 乂',
                    body: 'Please provide a valid WhatsApp group link',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    if (!psn.includes('https://chat.whatsapp.com/')) {
        await sock.sendMessage(id, {
            text: '❌ Link tidak valid! Pastikan menggunakan format https://chat.whatsapp.com/KODE',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Invalid Link',
                    body: 'Please check your group link format',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        return;
    }

    try {
        const filterCode = psn.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/)?.[1]
        const result = await sock.groupGetInviteInfo(filterCode)

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *GROUP INFORMATION* 」
├ *ID:* ${result.id}
├ *Name:* ${result.subject || '(No Name)'}
├ *Owner:* @${result.participants.filter((d) => d.admin === 'superadmin')[0].id.split('@')[0]}
├ *Members:* ${result.size}
├ *Created:* ${new Date(result.creation * 1000).toLocaleString()}
│
├ *Community ID:* 
├ ${result.linkedParent || '(Not in Community)'}
│
├ *Description:* 
${result.desc || '(No Description)'}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    mentionedJid: [result.participants.filter((d) => d.admin === 'superadmin')[0].id],
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 ${result.subject} 乂`,
                        body: `Group Information`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
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
            text: '❌ Terjadi kesalahan saat mengambil informasi grup: ' + error.message,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Stalking Failed',
                    body: 'An error occurred while fetching group info',
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
