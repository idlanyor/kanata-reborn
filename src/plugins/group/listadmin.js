import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = ['listadmin', 'adminlist'];
export const description = 'Menampilkan daftar admin grup';

export default async ({ sock, m, id }) => {
    try {
        const groupMetadata = await sock.groupMetadata(id);
        const admins = groupMetadata.participants.filter(p => p.admin);
        const ppgroup = await sock.profilePictureUrl(id, 'image').catch(_ => 'https://files.catbox.moe/2wynab.jpg');

        let adminList = admins.map((admin, i) => {
            const adminName = admin.admin === 'superadmin' ? '👑' : '👮‍♂️';
            return `${i + 1}. ${adminName} @${admin.id.split('@')[0]}`;
        }).join('\n');

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ADMIN LIST* 」
├ 📝 *Grup:* ${groupMetadata.subject}
├ 👥 *Total Admin:* ${admins.length}
│
${adminList}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    mentionedJid: admins.map(a => a.id),
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 Admin List 乂`,
                        body: `${groupMetadata.subject}`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: ppgroup,
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                    }
                }
            }
        }), { userJid: id, quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '👮‍♂️',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Admin List Error',
                    body: 'An error occurred while fetching admin list',
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