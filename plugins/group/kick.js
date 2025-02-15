export const handler = 'kick'
export const description = 'Mengeluarkan anggota dari group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, { 
            text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.kick @user*\n\n📌 Contoh:\n*.kick @user*',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Group Manager 乂',
                    body: 'Kick member from group',
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
        await sock.groupParticipantsUpdate(id, [psn.replace('@', '') + '@s.whatsapp.net'], 'remove')
        await sock.sendMessage(id, { 
            text: `✅ Berhasil mengeluarkan *${psn.trim()}* dari grup!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Kicked',
                    body: 'Successfully removed member',
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '👢', 
                key: m.key 
            } 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *Gagal mengeluarkan member:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Kick',
                    body: 'An error occurred',
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
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