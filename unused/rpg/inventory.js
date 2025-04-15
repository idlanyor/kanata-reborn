import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        const inventory = await RPG.getInventory(noTel);
        
        if (!inventory || inventory.length === 0) {
            await sock.sendMessage(id, { text: '📦 Inventory kosong!' });
            return;
        }

        // Buat Map untuk menyimpan item
        global.inventoryMap = new Map();
        let itemNumber = 1;

        // Kelompokkan berdasarkan tipe
        const grouped = inventory.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        let text = '*📦 INVENTORY*\n\n';

        // Icon untuk setiap kategori
        const icons = {
            weapon: '⚔️',
            armor: '🛡️',
            potion: '🧪',
            food: '🍖',
            material: '📦',
            misc: '🎁'
        };

        // Tampilkan items per kategori
        Object.entries(grouped).forEach(([type, items]) => {
            const icon = icons[type] || '📦';
            text += `${icon} *${type.toUpperCase()}*\n`;
            
            items.forEach(item => {
                // Simpan ke inventoryMap
                global.inventoryMap.set(itemNumber, item);
                
                text += `${itemNumber}. ${item.name}`;
                if (item.quantity > 1) text += ` (${item.quantity})`;
                if (item.equipped) text += ' ✅';
                text += '\n';
                
                // Tampilkan efek jika ada
                if (item.effect) {
                    const effect = typeof item.effect === 'string' ? 
                        JSON.parse(item.effect) : item.effect;
                    Object.entries(effect).forEach(([stat, value]) => {
                        const icon = getStatIcon(stat);
                        text += `${icon} ${stat}: +${value}\n`;
                    });
                }
                
                text += `💰 Jual: ${Math.floor(item.price * 0.7)} gold\n\n`;
                itemNumber++;
            });
            text += '\n';
        });

        text += '\n*Penggunaan:*\n';
        text += '.pakai <nomor> - Pakai item\n';
        text += '.jual <nomor> <jumlah> - Jual item';

        await sock.sendMessage(id, { text });
    } catch (error) {
        console.error('Inventory error:', error);
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['inv', 'inventory'];
export const description = 'Lihat isi inventory\nPenggunaan: !inv'; 