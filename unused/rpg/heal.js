import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        const healAmount = await RPG.heal(noTel);
        await sock.sendMessage(id, { 
            text: `✨ Berhasil menyembuhkan HP sebanyak ${healAmount}!` 
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['heal', 'sembuh'];
export const description = 'Menyembuhkan HP\nCooldown: 3 menit'; 