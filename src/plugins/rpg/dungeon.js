import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const dungeons = await RPG.getAllDungeons();
            let text = '*🏰 DUNGEONS*\n\n';
            
            dungeons.forEach(d => {
                text += `*${d.name}*\n`;
                text += `📊 Level Min: ${d.min_level}\n`;
                text += `❤️ HP: ${d.hp}\n`;
                text += `⚔️ Attack: ${d.attack}\n`;
                text += `🛡️ Defense: ${d.defense}\n`;
                text += `✨ EXP: ${d.exp_reward}\n`;
                text += `💰 Gold: ${d.gold_reward}\n`;
                text += `⏰ Cooldown: ${d.cooldown_minutes} menit\n\n`;
            });
            
            text += 'Untuk masuk dungeon: !dungeon <nama_dungeon>';
            
            await sock.sendMessage(id, { text });
            return;
        }

        await RPG.initPlayer(noTel);
        const result = await RPG.enterDungeon(noTel, psn);
        
        let text = `*⚔️ DUNGEON BATTLE - ${psn}*\n\n`;
        text += result.battleLog.join('\n');
        text += '\n\n';
        
        if (result.win) {
            text += '🎉 *DUNGEON CLEARED!*\n';
            text += `✨ EXP: +${result.rewards.exp}\n`;
            text += `💰 Gold: +${result.rewards.gold}\n`;
            if (result.rewards.items.length > 0) {
                text += `📦 Items: ${result.rewards.items.join(', ')}\n`;
            }
        } else {
            text += '💀 *GAME OVER*\nCoba lagi setelah lebih kuat!';
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'dungeon'; 