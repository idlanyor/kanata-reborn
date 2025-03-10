import User from '../../database/models/User.js';

export default async ({ sock, m, id }) => {
    try {
        const leaderboard = await User.getLeaderboard(10);
        
        let leaderboardText = `*🏆 TOP 10 LEADERBOARD*\n\n`;
        leaderboard.forEach((user, index) => {
            leaderboardText += `${index + 1}. ${user.name}\n`;
            leaderboardText += `   Level: ${user.level} | EXP: ${user.exp}\n`;
            leaderboardText += `   Pesan: ${user.total_messages} | Command: ${user.total_commands}\n\n`;
        });

        await sock.sendMessage(id, { text: leaderboardText });
    } catch (error) {
        await sock.sendMessage(id, { text: `Terjadi kesalahan: ${error.message}` });
    }
};

export const handler = 'leaderboard'; 