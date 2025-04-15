import RPG from '../../database/models/RPG.js';

export const description = "Toko untuk membeli dan menjual berbagai item";
export const handler = "toko";

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const items = await RPG.getShopItems();
            if (!items || items.length === 0) {
                throw new Error('Tidak ada item di toko!');
            }

            // Buat Map untuk menyimpan item
            global.itemMap = new Map();
            let itemNumber = 1;

            // Kelompokkan item berdasarkan kategori
            const categories = {
                weapon: '⚔️ SENJATA',
                armor: '🛡️ ARMOR',
                consumable: '🧪 CONSUMABLE',
                food: '🍖 MAKANAN',
                drink: '🥤 MINUMAN'
            };

            let text = '*🏪 TOKO ITEM*\n\n';

            for (const [category, title] of Object.entries(categories)) {
                const categoryItems = items.filter(item => item.type === category);
                if (categoryItems.length > 0) {
                    text += `${title}\n`;
                    text += `─────────────\n`;
                    
                    categoryItems.forEach(item => {
                        // Simpan item ke Map
                        global.itemMap.set(itemNumber, item);
                        
                        text += `${itemNumber}. ${item.name}\n`;
                        text += `💰 Harga: ${item.price} gold\n`;
                        
                        // Parse efek item
                        if (item.effect) {
                            const effect = typeof item.effect === 'string' ? 
                                JSON.parse(item.effect) : item.effect;
                            
                            Object.entries(effect).forEach(([stat, value]) => {
                                const icon = getStatIcon(stat);
                                text += `${icon} ${stat}: +${value}\n`;
                            });
                        }
                        
                        text += `\n`;
                        itemNumber++;
                    });
                }
            }
            
            // Jika tidak ada item yang ditampilkan
            if (itemNumber === 1) {
                text += 'Tidak ada item yang tersedia saat ini.\n';
            }
            
            text += '\n📝 *CARA PENGGUNAAN*\n';
            text += '!beli <nomor_item> <jumlah>\n';
            text += '!jual <nomor_item> <jumlah>\n\n';
            text += '💡 Ketik !inv untuk cek inventory';
            
            await sock.sendMessage(id, { text });
            return;
        }

        const [cmd, itemNumber, quantity = 1] = psn.split(' ');
        
        if (cmd === 'jual') {
            // Validasi input
            if (!itemNumber) {
                throw new Error('Masukkan nomor item yang ingin dijual!\nContoh: !jual 1 5');
            }

            const qty = parseInt(quantity);
            if (isNaN(qty) || qty < 1) {
                throw new Error('Jumlah item tidak valid!');
            }

            // Ambil data inventory user
            const inventory = await RPG.getInventory(noTel);
            if (!inventory || (Array.isArray(inventory) && inventory.length === 0)) {
                throw new Error('Inventory kosong!');
            }

            // Cek dan jual item
            const result = await RPG.sellItem(noTel, itemNumber, qty);
            
            // Kirim pesan konfirmasi
            const replyText = `✅ Berhasil menjual ${result.item.name} x${result.amount}\n` +
                            `💰 Dapat: ${result.totalPrice} gold\n` +
                            `📦 Sisa: ${result.remainingQuantity} item`;
            
            await sock.sendMessage(id, { text: replyText });
            return;
        }

        if (cmd === 'beli') {
            // Validasi input
            if (!itemNumber) {
                throw new Error('Masukkan nomor item yang ingin dibeli!\nContoh: !beli 1 5');
            }

            const qty = parseInt(quantity);
            if (isNaN(qty) || qty < 1) {
                throw new Error('Jumlah item tidak valid!');
            }

            // Cek dan beli item
            const item = global.itemMap?.get(parseInt(itemNumber));
            if (!item) {
                throw new Error('Nomor item tidak valid! Ketik !toko untuk melihat daftar item.');
            }

            const result = await RPG.buy(noTel, item.id, qty);
            
            // Kirim pesan konfirmasi
            const replyText = `✅ Berhasil membeli ${result.item} x${result.quantity}\n` +
                            `💰 Harga: ${result.totalCost} gold`;
            
            await sock.sendMessage(id, { text: replyText });
            return;
        }

    } catch (error) {
        console.error('Error in toko:', error);
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const tags = ['rpg'];
export const command = ['toko', 'shop'];
export const help = `
*🏪 Toko RPG*

Buka toko untuk beli/jual item
Penggunaan:
- !toko - Lihat daftar item
- !beli <nomor_item> <jumlah> - Beli item
- !jual <nomor_item> <jumlah> - Jual item

Contoh:
!beli 1 5 - Beli item nomor 1 sebanyak 5
!jual 2 3 - Jual item nomor 2 sebanyak 3
`.trim(); 