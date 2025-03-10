import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const healAmount = await RPG.heal(noTel);
        
        let text = `*💚 HEALING*\n\n`;
        text += `Berhasil memulihkan ${healAmount} HP!`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'heal'; 