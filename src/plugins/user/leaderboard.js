import User from '../../database/models/User.js';
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


export default async ({ sock, m, id, noTel }) => {
    try {
        const leaderboard = await User.getLeaderboard(10);
        const userRank = await User.getUserRank(noTel);
        
        // Emoji untuk ranking
        const medals = ['🥇', '🥈', '🥉'];
        
        let leaderboardText = `╭─「 *TOP 10 LEADERBOARD* 」\n`;
        
        leaderboard.forEach((user, index) => {
            // Hitung progress ke level berikutnya
            const expNeeded = user.level * 1000;
            const progress = ((user.exp / expNeeded) * 100).toFixed(1);
            
            // Tentukan emoji ranking
            const rankEmoji = medals[index] || `${index + 1}.`;
            
            leaderboardText += `├─────────────\n`;
            leaderboardText += `├ ${rankEmoji} *${user.name}*\n`;
            leaderboardText += `├ 📊 Level: ${user.level} (${progress}%)\n`;
            leaderboardText += `├ ✨ EXP: ${user.exp}\n`;
            leaderboardText += `├ 💬 Pesan: ${user.total_messages}\n`;
            leaderboardText += `├ ⌨️ Command: ${user.total_commands}\n`;
        });
        
        // Tambahkan informasi rank user yang melihat
        leaderboardText += `├─────────────\n`;
        if (userRank) {
            leaderboardText += `├ *Rank Kamu:* #${userRank.position}\n`;
        }
        leaderboardText += `╰──────────────────\n\n`;
        leaderboardText += `_Update setiap kali command dijalankan_`;

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: leaderboardText,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: '🏆 Global Leaderboard',
                        body: 'Top 10 Most Active Users',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                    }
                }
            }
        }), { userJid: id, quoted: m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        
        // Tambah reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '📊',
                key: m.key
            }
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan: ${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Leaderboard Error',
                    body: 'Failed to fetch leaderboard data',
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                }
            }
        });
        
        // Tambah reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
};

export const handler = ['leaderboard', 'lb'];
export const description = "Menampilkan 10 user teratas berdasarkan level dan exp"; 