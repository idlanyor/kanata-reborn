export const handler = 'add'
export const description = 'Menambahkan anggota ke dalam group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, { 
            text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.add @user*\n\n📌 Contoh:\n*.add @user*',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Group Manager 乂',
                    body: 'Add member to group',
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
        let res = await sock.groupParticipantsUpdate(id, [psn.replace('@', '') + '@s.whatsapp.net'], 'add')
        await sock.sendMessage(id, { 
            text: `✅ Berhasil menambahkan *${psn.trim()}* ke dalam grup!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Added',
                    body: 'Successfully added new member',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '✅', 
                key: m.key 
            } 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *Gagal menambahkan member:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Add',
                    body: 'An error occurred',
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