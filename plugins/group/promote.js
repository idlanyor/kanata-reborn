export const handler = 'promote'
export const description = 'Menaikkan pangkat anggota grup menjadi Admin'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        await sock.sendMessage(id, { 
            text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.promote @user*\n\n📌 Contoh:\n*.promote @user*',
            contextInfo: {
                externalAdReply: {
                    title: '乂 Group Manager 乂',
                    body: 'Promote member to admin',
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
        await sock.groupParticipantsUpdate(id, [psn.replace('@', '') + '@s.whatsapp.net'], 'promote')
        await sock.sendMessage(id, { 
            text: `👑 Berhasil menjadikan *${psn.trim()}* sebagai admin!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Promoted',
                    body: 'Successfully promoted to admin',
                    thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '👑', 
                key: m.key 
            } 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *Gagal menaikkan pangkat:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Promote',
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