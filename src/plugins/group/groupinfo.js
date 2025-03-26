import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = ['groupinfo', 'gcinfo'];
export const description = 'Menampilkan informasi grup';

export default async ({ sock, m, id }) => {
    try {
        const groupMetadata = await sock.groupMetadata(id);
        const ppgroup = await sock.profilePictureUrl(id, 'image').catch(_ => 'https://files.catbox.moe/2wynab.jpg');

        // Hitung jumlah admin
        const adminCount = groupMetadata.participants.filter(p => p.admin).length;

        // Format tanggal pembuatan
        const createdDate = new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *GROUP INFORMATION* 」
├ 📝 *Nama:* ${groupMetadata.subject}
├ 🆔 *ID:* ${groupMetadata.id}
├ 👥 *Member:* ${groupMetadata.participants.length}
├ 👑 *Admin:* ${adminCount}
├ 📅 *Dibuat:* ${createdDate}
├ 👑 *Owner:* @${groupMetadata.owner?.split('@')[0] || 'Tidak diketahui'}
│
├ *Deskripsi:* 
${groupMetadata.desc || '(Tidak ada deskripsi)'}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    mentionedJid: groupMetadata.owner ? [groupMetadata.owner] : [],
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 ${groupMetadata.subject} 乂`,
                        body: `${groupMetadata.participants.length} Members • ${adminCount} Admins`,
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
                text: '📊',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Group Info Error',
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