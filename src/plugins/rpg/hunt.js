import RPG from '../../database/models/RPG.js';

export const description = "Berburu monster untuk mendapatkan exp dan item";
export const handler = "hunt"
export default async ({ sock, m, id, psn, sender, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const result = await RPG.hunt(noTel);
        
        let text = `🗡️ *HASIL BERBURU*\n\n`;
        text += `⚔️ Monster: ${result.monster}\n`;
        text += `💥 Damage: ${result.damage}\n`;
        text += `🎯 HP Monster: ${result.monsterHp}\n`;
        text += `❤️ HP Kamu: ${result.playerHp}\n\n`;
        text += `📦 Rewards:\n`;
        text += `💰 Gold: +${result.gold}\n`;
        text += `✨ EXP: +${result.exp}\n`;
        
        if (result.items.length > 0) {
            text += `\n🎁 Items:\n`;
            result.items.forEach(item => {
                text += `- ${item.name} x${item.quantity}\n`;
            });
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
}; 