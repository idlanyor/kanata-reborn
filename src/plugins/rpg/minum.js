import RPG from '../../database/models/RPG.js';

export const description = "Minum untuk memulihkan thirst dan energi";
export const handler = "minum";

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const inventory = await RPG.getInventory(noTel);
            const drinks = inventory.filter(item => item.type === 'drink');
            
            if (drinks.length === 0) {
                await sock.sendMessage(id, { text: '❌ Kamu tidak punya minuman!' });
                return;
            }

            let text = '*🥤 MINUMAN DI INVENTORY*\n\n';
            let itemNumber = 1;
            global.drinkMap = new Map();

            drinks.forEach(drink => {
                global.drinkMap.set(itemNumber, {
                    id: drink.item_id,
                    name: drink.name,
                    type: drink.type,
                    effect: drink.effect
                });

                text += `[${itemNumber}] ${drink.name} x${drink.quantity}\n`;
                if (drink.effect) {
                    try {
                        const effect = JSON.parse(drink.effect);
                        if (effect.thirst) text += `🥤 Haus +${effect.thirst}\n`;
                        if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
                        if (effect.mana) text += `💫 Mana +${effect.mana}\n`;
                    } catch (e) {
                        console.error('Error parsing effect:', e);
                    }
                }
                text += '\n';
                itemNumber++;
            });

            text += '\nCara pakai: !minum <nomor_minuman>';
            await sock.sendMessage(id, { text });
            return;
        }

        const drinkNumber = parseInt(psn);
        if (isNaN(drinkNumber)) {
            throw new Error('Nomor minuman harus berupa angka!');
        }

        const drinkData = global.drinkMap?.get(drinkNumber);
        if (!drinkData) {
            throw new Error('Nomor minuman tidak valid! Ketik !minum untuk melihat daftar minuman.');
        }

        const result = await RPG.drink(noTel, drinkNumber);
        let text = `*🥤 MINUM ${result.name}*\n\n`;
        text += `Efek:\n`;
        if (result.thirst) text += `🥤 Haus +${result.thirst}\n`;
        if (result.energy) text += `⚡ Energi +${result.energy}\n`;
        if (result.mana) text += `💫 Mana +${result.mana}\n`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        console.error('Error in minum command:', error);
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
}; 