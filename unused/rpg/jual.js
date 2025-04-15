import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            throw new Error('Masukkan nomor item dan jumlah!\nContoh: !jual 1 5');
        }

        const [itemNumber, quantity = 1] = psn.split(' ');
        const qty = parseInt(quantity);

        if (isNaN(qty) || qty < 1) {
            throw new Error('Jumlah item tidak valid!');
        }

        const result = await RPG.sellItem(noTel, parseInt(itemNumber), qty);
        
        const text = `✅ Berhasil menjual ${result.item.name} x${result.amount}\n` +
                    `💰 Dapat: ${result.totalPrice} gold\n` +
                    `📦 Sisa: ${result.remainingQuantity} item`;
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['jual', 'sell'];
export const description = 'Jual item dari inventory\nPenggunaan: !jual <nomor_item> <jumlah>'; 