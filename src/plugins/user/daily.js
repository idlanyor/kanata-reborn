import User from '../../database/models/User.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        const result = await User.claimDaily(noTel);
        
        let message = `*🎁 DAILY REWARD*\n\n`;
        message += `✨ +${result.dailyExp} EXP\n`;
        
        if (result.levelUp) {
            message += `🎉 Selamat! Level kamu naik ke level ${result.newLevel}!\n`;
        }
        
        message += `\n📊 Progress:\n`;
        message += `Level: ${result.newLevel}\n`;
        message += `EXP: ${result.currentExp}/${result.expNeeded}`;

        await sock.sendMessage(id, { text: message });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ ${error.message}` });
    }
};

export const handler = 'daily'; 