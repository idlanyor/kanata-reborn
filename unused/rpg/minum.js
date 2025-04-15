import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const inventory = await RPG.getInventory(noTel);
            const drinks = inventory.filter(item => item.type === 'drink');
            
            if (!drinks.length) {
                throw new Error('Kamu tidak punya minuman!');
            }

            let text = '*🥤 DAFTAR MINUMAN*\n\n';
            let itemNumber = 1;
            global.drinkMap = new Map();

            drinks.forEach(drink => {
                global.drinkMap.set(itemNumber, drink);
                text += `[${itemNumber}] ${drink.name} x${drink.quantity}\n`;
                
                const effect = typeof drink.effect === 'string' ? 
                    JSON.parse(drink.effect) : drink.effect;
                
                if (effect.thirst) text += `🥤 Haus +${effect.thirst}\n`;
                if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
                if (effect.mana) text += `💫 Mana +${effect.mana}\n`;
                text += '\n';
                itemNumber++;
            });

            text += '\nKetik !minum <nomor> untuk meminum';
            await sock.sendMessage(id, { text });
            return;
        }

        const drinkNumber = parseInt(psn);
        const effect = await RPG.drink(noTel, drinkNumber);
        
        let text = '✨ *EFEK MINUMAN*\n\n';
        if (effect.thirst) text += `🥤 Haus +${effect.thirst}\n`;
        if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
        if (effect.mana) text += `💫 Mana +${effect.mana}\n`;
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['minum', 'drink'];
export const description = 'Minum minuman dari inventory\nPenggunaan: !minum <nomor_minuman>'; 