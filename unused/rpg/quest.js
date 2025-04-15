import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        const quests = await RPG.getQuests(noTel);
        let text = '*📜 QUEST LIST*\n\n';
        
        if (!quests || quests.length === 0) {
            text += 'Tidak ada quest yang tersedia saat ini.';
        } else {
            quests.forEach(quest => {
                text += `${quest.completed ? '✅' : '❌'} ${quest.name}\n`;
                text += `📝 ${quest.description}\n`;
                text += `📊 Progress: ${quest.progress}/${quest.target_amount}\n`;
                
                const rewards = JSON.parse(quest.rewards);
                text += '🎁 Rewards:\n';
                if (rewards.gold) text += `💰 Gold: ${rewards.gold}\n`;
                if (rewards.exp) text += `✨ EXP: ${rewards.exp}\n`;
                if (rewards.items) {
                    text += '📦 Items:\n';
                    Object.entries(rewards.items).forEach(([item, qty]) => {
                        text += `- ${item} x${qty}\n`;
                    });
                }
                text += '\n';
            });
        }
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['quest', 'quests'];
export const help = 'Lihat daftar quest yang tersedia'; 