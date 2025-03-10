import RPG from '../../database/models/RPG.js';

export const description = "Cek inventory dan equipment kamu";
export const handler = "inv";

export default async ({ sock, m, id, noTel }) => {
    try {
        const inventory = await RPG.getInventory(noTel);
        let text = '*📦 INVENTORY*\n\n';
        
        // Group items by type
        const groupedItems = inventory.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        let itemNumber = 1;
        // Simpan map di global untuk diakses oleh command jual
        global.inventoryMap = new Map();

        for (const [type, items] of Object.entries(groupedItems)) {
            text += `*${type.toUpperCase()}*\n`;
            items.forEach(item => {
                global.inventoryMap.set(itemNumber, {
                    id: item.id,
                    name: item.name,
                    price: item.price
                });
                text += `[${itemNumber}] ${item.name} x${item.quantity}\n`;
                text += `💰 Harga Jual: ${Math.floor(item.price * 0.7)} gold\n`;
                if (item.durability) text += `  Durability: ${item.durability}%\n`;
                itemNumber++;
            });
            text += '\n';
        }

        text += '\n💡 Untuk menjual: !jual <nomor_item> <jumlah>';

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};