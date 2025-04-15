import RPG from '../../src/database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        // Inisialisasi player jika belum ada
        await RPG.initPlayer(noTel);
        
        const result = await RPG.scavenge(noTel);
        
        let text = '*♻️ HASIL MULUNG*\n\n';
        
        // Tampilkan item yang didapat
        if (result.items && result.items.length > 0) {
            text += '📦 Item masuk inventory:\n';
            result.items.forEach(item => {
                text += `- ${item.name} x${item.quantity} (${item.value} gold)\n`;
            });
        } else {
            text += '❌ Tidak menemukan item apapun...\n';
        }

        text += `\n💰 Total nilai: ${result.totalValue} gold\n`;
        text += `⚡ Energi: -${result.energyLost}\n`;
        text += `✨ EXP: +${result.expGained}\n`;
        
        if (result.levelUp) {
            text += `\n🎉 Level Up! Sekarang level ${result.newLevel}!`;
        }
        
        text += '\n\n💡 Ketik .inv untuk cek inventory';
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        console.error('Mulung error:', error);
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const tags = ['rpg'];
export const handler = ['mulung', 'scavenge'];
export const description = `
*♻️ MULUNG*

Mencari barang bekas untuk dijual
- Minimal energi: 10
- Cooldown: 5 menit
- Dapat exp dan gold
- Item masuk ke inventory
- Bisa dijual dengan command .jual

Penggunaan: .mulung
`.trim(); 