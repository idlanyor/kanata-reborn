import RPG from '../../database/models/RPG.js';

export const description = "Makan makanan untuk memulihkan hunger dan energi";
export const handler = "makan";

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const inventory = await RPG.getInventory(noTel);
            const foods = inventory.filter(item => item.type === 'food');
            
            if (foods.length === 0) {
                await sock.sendMessage(id, { text: '❌ Kamu tidak punya makanan!' });
                return;
            }

            let text = '*🍖 MAKANAN DI INVENTORY*\n\n';
            let itemNumber = 1;
            global.foodMap = new Map();

            foods.forEach(food => {
                global.foodMap.set(itemNumber, {
                    id: food.id,
                    name: food.name,
                    effect: food.effect
                });
                text += `[${itemNumber}] ${food.name} x${food.quantity}\n`;
                if (food.effect) {
                    const effect = JSON.parse(food.effect);
                    if (effect.hunger) text += `🍖 Lapar +${effect.hunger}\n`;
                    if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
                    if (effect.health) text += `❤️ HP +${effect.health}\n`;
                }
                text += '\n';
                itemNumber++;
            });

            text += '\nCara pakai: !makan <nomor_makanan>';
            await sock.sendMessage(id, { text });
            return;
        }

        const foodNumber = parseInt(psn);
        const foodData = global.foodMap?.get(foodNumber);

        if (!foodData) {
            throw new Error('Nomor makanan tidak valid!');
        }

        const result = await RPG.eat(noTel, foodNumber);
        let text = `*🍖 MAKAN ${foodData.name}*\n\n`;
        text += `Efek:\n`;
        if (result.hunger) text += `🍖 Lapar +${result.hunger}\n`;
        if (result.energy) text += `⚡ Energi +${result.energy}\n`;
        if (result.health) text += `❤️ HP +${result.health}\n`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
}; 