import User from '../../database/models/User.js';
import pkg from '@fizzxydev/baileys-pro';
import { getPpUrl } from "../../helper/bot.js";
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

        // Ambil PP URL pengguna
        const ppUrl = await getPpUrl(sock, noTel);

        const expNeeded = user.level * 1000;
        const progress = (user.exp / expNeeded) * 100;

        // Generate progress bar
        const progressBarLength = 10;
        const filledBars = Math.round((progress / 100) * progressBarLength);
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(progressBarLength - filledBars);

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *USER PROFILE* 」
├ 👤 *Nama:* ${user.name}
├ 📱 *Nomor:* ${user.phone}
├ 🎯 *Nama Panggilan:* ${user.nickname || '(belum diatur)'}
├ 👥 *Jenis Kelamin:* ${user.gender || '(belum diatur)'}
├ 🕌 *Agama:* ${user.religion || '(belum diatur)'}
├ 🌆 *Kota:* ${user.city || '(belum diatur)'}
├ 📅 *Tanggal Lahir:* ${user.birthdate || '(belum diatur)'}
├ 🎨 *Hobi:* ${user.hobby || '(belum diatur)'}
├ 💭 *Bio:* ${user.bio || '(belum diatur)'}
│
├─「 *STATISTIK* 」
├ 📈 *Level:* ${user.level}
├ ✨ *EXP:* ${progressBar} ${progress.toFixed(1)}%
├ 💫 *Progress:* ${user.exp}/${expNeeded}
├ 💬 *Total Pesan:* ${user.total_messages}
├ ⌨️ *Total Command:* ${user.total_commands}
├ 📅 *Bergabung:* ${new Date(user.join_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}
╰──────────────────

💡 _Ketik .setbio untuk mengatur biodata_
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
                        thumbnailUrl: ppUrl,
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                    }
                }
            }
        }), { userJid: id, quoted:m });

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