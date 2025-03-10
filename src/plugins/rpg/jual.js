import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: 'Format: !jual <nama_item> <jumlah>' });
            return;
        }

        const [itemName, quantity = "1"] = psn.split(' ');
        await RPG.initPlayer(noTel);
        const result = await RPG.sell(noTel, itemName, parseInt(quantity));
        
        let text = `*💰 PENJUALAN BERHASIL*\n\n`;
        text += `Item: ${result.item}\n`;
        text += `Jumlah: ${result.quantity}\n`;
        text += `Total: ${result.totalEarned} gold`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'jual'; 