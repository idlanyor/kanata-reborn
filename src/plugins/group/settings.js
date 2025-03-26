import Group from '../../database/models/Group.js';
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = 'settings';
export const description = 'Mengatur fitur grup';
export default async ({ sock, m, id, psn, sender }) => {
    try {
        if (!psn) {
            const settings = await Group.getSettings(id);
            const message = generateWAMessageFromContent(id, proto.Message.fromObject({
                extendedTextMessage: {
                    text: `╭─「 *GROUP SETTINGS* 」
├ 🔗 *Antilink:* ${settings.antilink ? '✅' : '❌'}
  ├─ *Warning:* ${settings.antilink ? '3x Kick' : '-'}
  ├─ *Note:* Kecuali link download yang diizinkan
├ 👋 *Welcome:* ${settings.welcome ? '✅' : '❌'}
├ 👋 *Goodbye:* ${settings.goodbye ? '✅' : '❌'}
├ 🔄 *Antispam:* ${settings.antispam ? '✅' : '❌'}
├ 🤬 *Antitoxic:* ${settings.antitoxic ? '✅' : '❌'}
  ├─ *Warning:* ${settings.antitoxic ? '5x Kick' : '-'}
├ 📢 *Antipromosi:* ${settings.antipromosi ? '✅' : '❌'}
  ├─ *Warning:* ${settings.antipromosi ? '3x Kick' : '-'}
├ 👑 *Only Admin:* ${settings.only_admin ? '✅' : '❌'}
│
├ 📝 *Cara mengubah:*
├ .settings <fitur> on/off
╰──────────────────

_Powered by Kanata-V3_`,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 9999999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Kanata Settings',
                            serverMessageId: -1
                        },
                        externalAdReply: {
                            title: '乂 Group Settings 乂',
                            body: 'Manage your group settings',
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                        }
                    }
                }
            }), { userJid: id, quoted:m });

            await sock.relayMessage(id, message.message, { messageId: message.key.id });
            return;
        }

        const [feature, value] = psn.split(' ');
        if (!['antilink', 'welcome', 'goodbye', 'antispam', 'antitoxic', 'antipromosi', 'only_admin'].includes(feature)) {
            await sock.sendMessage(id, {
                text: '❌ Fitur tidak valid!',
                contextInfo: {
                    externalAdReply: {
                        title: '❌ Invalid Feature',
                        body: 'Feature not found',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                    }
                }
            });
            return;
        }

        const newValue = value === 'on';
        await Group.updateSetting(id, feature, newValue);
        await sock.sendMessage(id, {
            text: `✅ Berhasil mengubah *${feature}* menjadi *${newValue ? 'aktif' : 'nonaktif'}*`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Settings Updated',
                    body: 'Successfully updated group settings',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '⚙️',
                key: m.key
            }
        });
    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Settings Error',
                    body: 'An error occurred',
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