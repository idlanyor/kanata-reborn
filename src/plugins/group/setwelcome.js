import Group from '../../database/models/Group.js';
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = 'setwelcome';
export const description = 'Mengatur pesan sambutan untuk anggota baru';
export default async ({ sock, m, id, psn, sender }) => {
    try {
        // Pastikan grup sudah diinisialisasi
        await Group.initGroup(id);

        // Jika tidak ada pesan, tampilkan pesan welcome saat ini
        if (!psn) {
            const settings = await Group.getSettings(id);
            await sock.sendMessage(id, {
                text: `*Pesan Welcome Saat Ini:*\n\n${settings.welcome_message}\n\n*Cara mengubah:*\n.setwelcome Pesan baru\n\n_Catatan: Gunakan @user untuk menyebut member baru dan @group untuk nama grup_`,
                contextInfo: {
                    externalAdReply: {
                        title: '👋 Welcome Message Settings',
                        body: 'Customize your welcome message',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
            return;
        }

        // Update pesan welcome
        await Group.updateSetting(id, 'welcome_message', psn);

        // Kirim konfirmasi
        await sock.sendMessage(id, {
            text: `✅ *Pesan welcome berhasil diperbarui!*\n\n*Pesan baru:*\n${psn}\n\n_Catatan: Pastikan fitur welcome diaktifkan dengan perintah .settings welcome on_`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Welcome Message Updated',
                    body: 'Successfully updated welcome message',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '👋',
                key: m.key
            }
        });
    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Error',
                    body: 'An error occurred',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        }, { quoted: m });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
};
