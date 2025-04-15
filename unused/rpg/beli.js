import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            throw new Error('Masukkan nomor item dan jumlah!\nContoh: !beli 1 5');
        }

        const [itemNumber, quantity = 1] = psn.split(' ');
        const qty = parseInt(quantity);

        if (isNaN(qty) || qty < 1) {
            throw new Error('Jumlah item tidak valid!');
        }

        const result = await RPG.buy(noTel, parseInt(itemNumber), qty);
        
        const text = `✅ Berhasil membeli ${result.item} x${result.quantity}\n` +
                    `💰 Total harga: ${result.totalCost} gold`;
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const tags = ['rpg'];
export const command = ['beli', 'buy'];
export const help = 'Beli item dari toko\nPenggunaan: !beli <nomor_item> <jumlah>'; 