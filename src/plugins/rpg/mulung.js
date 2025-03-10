import RPG from '../../database/models/RPG.js';

export const description = "Mencari barang bekas untuk dijual";
export const handler = "mulung";

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const result = await RPG.scavenge(noTel);
        
        let text = `*🔍 HASIL MULUNG*\n\n`;
        text += `Kamu menemukan:\n`;
        result.items.forEach(item => {
            text += `📦 ${item.name} x${item.quantity}\n`;
        });
        text += `\n💰 Total nilai: ${result.totalValue} gold\n`;
        text += `⚡ Energi: -${result.energyLost}\n`;
        
        if (result.levelUp) {
            text += `\n🎉 Level Up! Sekarang level ${result.newLevel}!`;
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
}; 