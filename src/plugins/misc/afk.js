import AFK from '../../database/models/AFK.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        // Debug log
        console.log('Setting AFK for:', noTel)
        
        const reason = psn || 'Tidak ada alasan';
        const result = await AFK.setAFK(noTel, reason);
        
        // Debug log
        console.log('AFK result:', result)
        
        await sock.sendMessage(id, { 
            text: `*🚶 AFK MODE*\n\nKamu sekarang AFK\nAlasan: ${reason}`,
            contextInfo: {
                externalAdReply: {
                    title: '🚶 AFK Mode Activated',
                    body: `Reason: ${reason}`,
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                }
            }
        });
        
        await sock.sendMessage(id, {
            react: {
                text: '🚶',
                key: m.key
            }
        });
    } catch (error) {
        // Debug log
        console.error('AFK error:', error)
        
        await sock.sendMessage(id, { 
            text: `❌ ${error.message || 'Terjadi kesalahan saat mengaktifkan mode AFK'}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ AFK Activation Failed',
                    body: 'Please try again',
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                }
            }
        });
        
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
};

export const handler = 'afk'; 