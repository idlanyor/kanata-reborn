export const handler = 'demote'
export const description = 'Menurunkan pangkat anggota grup dari Admin'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, { 
            text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.demote @user*\n\n📌 Contoh:\n*.demote @user*',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Group Manager 乂',
                    body: 'Demote admin to member',
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
        await sock.groupParticipantsUpdate(id, [psn.replace('@', '') + '@s.whatsapp.net'], 'demote')
        await sock.sendMessage(id, { 
            text: `👥 Berhasil menurunkan *${psn.trim()}* menjadi member biasa!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Admin Demoted',
                    body: 'Successfully demoted to member',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '👥', 
                key: m.key 
            } 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *Gagal menurunkan pangkat:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Demote',
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