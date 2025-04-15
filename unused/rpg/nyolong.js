import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        if (!m.quoted) throw new Error('Reply pesan target yang mau dicuri!');
        
        const targetId = m.quoted.participant;
        const stolenAmount = await RPG.steal(noTel, targetId);
        
        await sock.sendMessage(id, { 
            text: `💰 Berhasil mencuri ${stolenAmount} gold!` 
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['nyolong', 'steal'];
export const description = 'Mencuri gold dari player lain\nCooldown: 10 menit\nResiko: 40% masuk penjara'; 