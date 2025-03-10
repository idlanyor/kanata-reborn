import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const stats = await RPG.getStats(noTel);
        
        let text = `*🎮 RPG PROFILE*\n\n`;
        text += `❤️ HP: ${stats.health}/${stats.max_health}\n`;
        text += `💫 MP: ${stats.mana}/${stats.max_mana}\n`;
        text += `💪 Strength: ${stats.strength}\n`;
        text += `🛡️ Defense: ${stats.defense}\n`;
        text += `⚡ Agility: ${stats.agility}\n`;
        text += `🧠 Intelligence: ${stats.intelligence}\n`;
        text += `💰 Gold: ${stats.gold}\n`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'rpg'; 