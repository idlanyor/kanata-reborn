import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const quests = await RPG.getQuests(noTel);
        
        let text = '*📜 QUESTS*\n\n';
        
        quests.forEach(q => {
            const progress = q.progress || 0;
            const status = q.completed ? '✅' : `${progress}/${q.target_amount}`;
            
            text += `*${q.name}* ${status}\n`;
            text += `📝 ${q.description}\n`;
            text += `📊 Level Min: ${q.min_level}\n`;
            text += `✨ EXP: ${q.exp_reward}\n`;
            text += `💰 Gold: ${q.gold_reward}\n`;
            if (q.item_reward) {
                const items = JSON.parse(q.item_reward);
                text += `📦 Items: ${Object.entries(items).map(([item, qty]) => `${item} x${qty}`).join(', ')}\n`;
            }
            text += '\n';
        });

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'quest'; 