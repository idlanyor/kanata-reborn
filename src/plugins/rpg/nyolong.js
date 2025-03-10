import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: 'Tag target yang mau dicuri!' });
            return;
        }

        await RPG.initPlayer(noTel);
        const targetId = psn.replace('@', '') + '@s.whatsapp.net';
        const stolenAmount = await RPG.steal(noTel, targetId);
        
        let text = `*💰 HASIL MENCURI*\n\n`;
        text += `Berhasil mencuri ${stolenAmount} gold!`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'nyolong'; 