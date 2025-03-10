import RPG from '../../database/models/RPG.js';

export const description = "Toko untuk membeli dan menjual berbagai item";
export const handler = "toko";

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const items = await RPG.getShopItems();
            let text = '*🏪 TOKO RPG*\n\n';
            
            // Kelompokkan item berdasarkan kategori
            const categories = {
                'weapon': '⚔️ SENJATA',
                'armor': '🛡️ ARMOR',
                'food': '🍖 MAKANAN',
                'drink': '🥤 MINUMAN',
                'potion': '🧪 RAMUAN',
                'material': '📦 MATERIAL',
                'tool': '🔨 PERALATAN',
                'scrap': '♻️ RONGSOKAN'
            };

            let itemNumber = 1;
            const itemMap = new Map();

            for (const [type, title] of Object.entries(categories)) {
                const categoryItems = items.filter(item => item.type === type);
                if (categoryItems.length > 0) {
                    text += `\n${title}\n`;
                    categoryItems.forEach(item => {
                        itemMap.set(itemNumber, item);
                        text += `\n[${itemNumber}] ${item.name}\n`;
                        text += `💰 Beli: ${item.price} gold\n`;
                        text += `💰 Jual: ${Math.floor(item.price * 0.7)} gold\n`;
                        text += `📝 ${item.description}\n`;
                        if (item.effect) {
                            const effect = JSON.parse(item.effect);
                            if (effect.hunger) text += `🍖 Lapar +${effect.hunger}\n`;
                            if (effect.thirst) text += `🥤 Haus +${effect.thirst}\n`;
                            if (effect.energy) text += `⚡ Energi +${effect.energy}\n`;
                            if (effect.health) text += `❤️ HP +${effect.health}\n`;
                            if (effect.mana) text += `💫 Mana +${effect.mana}\n`;
                            if (effect.attack) text += `⚔️ Attack +${effect.attack}\n`;
                            if (effect.defense) text += `🛡️ Defense +${effect.defense}\n`;
                        }
                        text += `\n`;
                        itemNumber++;
                    });
                    text += `─────────────\n`;
                }
            }
            
            // Simpan itemMap ke temporary storage
            global.itemMap = itemMap;
            
            text += '\n📝 *CARA PENGGUNAAN*\n';
            text += '!beli <nomor_item> <jumlah>\n';
            text += '!jual <nomor_item> <jumlah>\n\n';
            text += '💡 Ketik !inv untuk cek inventory';
            
            await sock.sendMessage(id, { text });
            return;
        }

        const [cmd, itemNumber, quantity = 1] = psn.split(' ');
        
        if (cmd === 'jual') {
            // Cek apakah inventoryMap ada
            if (!global.inventoryMap) {
                throw new Error('Silakan cek inventory dulu dengan !inv');
            }

            const itemData = global.inventoryMap.get(parseInt(itemNumber));
            if (!itemData) {
                throw new Error('Nomor item tidak valid! Cek !inv untuk daftar item');
            }

            console.log('Attempting to sell:', itemData); // Debug log

            const result = await RPG.sell(noTel, itemData.name, parseInt(quantity));
            await sock.sendMessage(id, { 
                text: `✅ Berhasil menjual ${result.item} x${result.quantity}\n💰 Dapat: ${result.totalEarned} gold` 
            });
            return;
        }

        if (cmd === 'beli') {
            const item = global.itemMap?.get(parseInt(itemNumber));
            if (!item) {
                throw new Error('Nomor item tidak valid!');
            }

            const result = await RPG.buy(noTel, item.name, parseInt(quantity));
            await sock.sendMessage(id, { 
                text: `✅ Berhasil membeli ${result.item} x${result.quantity}\n💰 Harga: ${result.totalCost} gold` 
            });
            return;
        }

    } catch (error) {
        console.error('Error in toko:', error); // Debug log
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const tags = ['rpg'];
export const command = ['toko', 'shop'];
export const help = 'Buka toko untuk beli/jual item\nPenggunaan: !toko [beli/jual] [nama_item] [jumlah]'; 