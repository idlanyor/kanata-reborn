import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        // Jika tidak ada parameter, tampilkan daftar dungeon
        if (!psn) {
            const dungeons = await RPG.getDungeons();
            let text = '*🏰 DAFTAR DUNGEON*\n\n';
            
            dungeons.forEach((dungeon, index) => {
                text += `${index + 1}. ${dungeon.name}\n`;
                text += `├ Level: ${dungeon.reqLevel}\n`;
                text += `├ HP Min: ${dungeon.reqHP}\n`;
                text += `├ Stamina: -${dungeon.staminaCost}\n`;
                text += `├ Reward: ${dungeon.expReward} EXP\n`;
                text += `└ Gold: ${dungeon.goldReward} gold\n\n`;
            });
            
            text += '\nGunakan .dungeon <nomor> untuk masuk dungeon';
            await sock.sendMessage(id, { text });
            return;
        }

        const dungeonNumber = parseInt(psn);
        if (isNaN(dungeonNumber)) {
            throw new Error('Nomor dungeon tidak valid!');
        }

        // Masuk dungeon
        const result = await RPG.enterDungeon(noTel, dungeonNumber);
        
        let battleText = `*⚔️ DUNGEON BATTLE*\n\n`;
        battleText += `Memasuki: ${result.dungeonName}\n\n`;
        
        if (result.success) {
            battleText += `✨ Berhasil menaklukan dungeon!\n`;
            battleText += `├ EXP: +${result.expGained}\n`;
            battleText += `├ Gold: +${result.goldGained}\n`;
            if (result.items?.length > 0) {
                battleText += `└ Items: ${result.items.join(', ')}\n`;
            }
        } else {
            battleText += `💀 Gagal! HP terlalu rendah\n`;
            battleText += `Sisa HP: ${result.currentHP}\n`;
        }

        await sock.sendMessage(id, { text: battleText });

    } catch (error) {
        console.error('Dungeon error:', error);
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['dungeon'];
export const description = 'Masuk ke dungeon untuk mendapatkan rewards\nPenggunaan: !dungeon <nama_dungeon>'; 