import User from '../../database/models/User.js';

export default async ({ sock, m, id, psn, sender, noTel }) => {
    try {
        const user = await User.getUser(noTel);
        if (!user) {
            await sock.sendMessage(id, { text: 'User tidak ditemukan dalam database' });
            return;
        }

        const expNeeded = user.level * 1000;
        const progress = (user.exp / expNeeded) * 100;

        let profileText = `*📊 PROFIL PENGGUNA*\n\n`;
        profileText += `👤 Nama: ${user.name}\n`;
        profileText += `📱 Nomor: ${user.phone}\n`;
        profileText += `📈 Level: ${user.level}\n`;
        profileText += `✨ EXP: ${user.exp}/${expNeeded} (${progress.toFixed(1)}%)\n`;
        profileText += `💬 Total Pesan: ${user.total_messages}\n`;
        profileText += `⌨️ Total Command: ${user.total_commands}\n`;
        profileText += `📅 Bergabung: ${new Date(user.join_date).toLocaleDateString()}\n`;

        await sock.sendMessage(id, { text: profileText });
    } catch (error) {
        await sock.sendMessage(id, { text: `Terjadi kesalahan: ${error.message}` });
    }
};

export const handler = ['profile', 'me']; 