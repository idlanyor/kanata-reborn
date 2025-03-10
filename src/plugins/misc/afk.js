import AFK from '../../database/models/AFK.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        const reason = psn || 'Tidak ada alasan';
        await AFK.setAFK(noTel, reason);
        
        await sock.sendMessage(id, { 
            text: `*🚶 AFK MODE*\n\nKamu sekarang AFK\nAlasan: ${reason}`
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'afk'; 