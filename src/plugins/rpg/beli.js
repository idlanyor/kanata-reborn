import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: 'Format: !beli <nama_item> <jumlah>' });
            return;
        }

        const [itemName, quantity = "1"] = psn.split(' ');
        await RPG.initPlayer(noTel);
        const result = await RPG.buy(noTel, itemName, parseInt(quantity));
        
        let text = `*🛍️ PEMBELIAN BERHASIL*\n\n`;
        text += `Item: ${result.item}\n`;
        text += `Jumlah: ${result.quantity}\n`;
        text += `Total: ${result.totalCost} gold`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'beli'; 