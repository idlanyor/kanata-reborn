import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const inventory = await RPG.getInventory(noTel);
            const foods = inventory.filter(item => item.type === 'food');
            
            if (!foods.length) {
                throw new Error('Kamu tidak punya makanan!');
            }

            let text = '*🍖 DAFTAR MAKANAN*\n\n';
            let itemNumber = 1;
            global.foodMap = new Map();

            foods.forEach(food => {
                global.foodMap.set(itemNumber, food);
                text += `[${itemNumber}] ${food.name} x${food.quantity}\n`;
                
                const effect = typeof food.effect === 'string' ? 
                    JSON.parse(food.effect) : food.effect;
                
                if (effect.hunger) text += `🍖 Lapar +${effect.hunger}\n`;
                if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
                if (effect.health) text += `❤️ HP +${effect.health}\n`;
                text += '\n';
                itemNumber++;
            });

            text += '\nKetik !makan <nomor> untuk memakan';
            await sock.sendMessage(id, { text });
            return;
        }

        const foodNumber = parseInt(psn);
        const effect = await RPG.eat(noTel, foodNumber);
        
        let text = '✨ *EFEK MAKANAN*\n\n';
        if (effect.hunger) text += `🍖 Lapar +${effect.hunger}\n`;
        if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
        if (effect.health) text += `❤️ HP +${effect.health}\n`;
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['makan', 'eat'];
export const description = 'Makan makanan dari inventory\nPenggunaan: !makan <nomor_makanan>'; 