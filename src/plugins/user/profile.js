import User from '../../database/models/User.js';
import pkg from '@seaavey/baileys';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = ['profile', 'me'];
export const description = "View User Profile";

export default async ({ sock, m, id, psn, sender, noTel }) => {
    try {
        const user = await User.getUser(noTel);
        if (!user) {
            await sock.sendMessage(id, {
                text: '❌ User tidak ditemukan dalam database',
                contextInfo: {
                    externalAdReply: {
                        title: '❌ Profile Error',
                        body: 'User not found in database',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                    }
                }
            });
            return;
        }

        const expNeeded = user.level * 1000;
        const progress = (user.exp / expNeeded) * 100;

        // Generate progress bar
        const progressBarLength = 10;
        const filledBars = Math.round((progress / 100) * progressBarLength);
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(progressBarLength - filledBars);

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *USER PROFILE* 」
├ 👤 *Name:* ${user.name}
├ 📱 *Number:* ${user.phone}
├ 📈 *Level:* ${user.level}
├ ✨ *EXP:* ${progressBar} ${progress.toFixed(1)}%
├ 💫 *Progress:* ${user.exp}/${expNeeded}
├ 💬 *Messages:* ${user.total_messages}
├ ⌨️ *Commands:* ${user.total_commands}
├ 📅 *Joined:* ${new Date(user.join_date).toLocaleDateString()}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    mentionedJid: [user.phone + "@s.whatsapp.net"],
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 ${user.name}'s Profile 乂`,
                        body: `Level ${user.level} • ${progress.toFixed(1)}% EXP`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                    }
                }
            }
        }), { userJid: id, quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '📊',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Profile Error',
                    body: 'An error occurred while fetching profile',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
}; 