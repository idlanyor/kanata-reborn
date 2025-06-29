import Group from '../../database/models/Group.js';
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


export const handler = 'setgoodbye';
export const description = 'Mengatur pesan perpisahan untuk anggota yang keluar';
export default async ({ sock, m, id, psn, sender }) => {
    try {
        // Pastikan grup sudah diinisialisasi
        await Group.initGroup(id);
        
        // Jika tidak ada pesan, tampilkan pesan goodbye saat ini
        if (!psn) {
            const settings = await Group.getSettings(id);
            await sock.sendMessage(id, {
                text: `*Pesan Goodbye Saat Ini:*\n\n${settings.goodbye_message}\n\n*Cara mengubah:*\n.setgoodbye Pesan baru\n\n_Catatan: Gunakan @user untuk menyebut member yang keluar dan @group untuk nama grup_`,
                contextInfo: {
                    externalAdReply: {
                        title: '👋 Goodbye Message Settings',
                        body: 'Customize your goodbye message',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
            return;
        }

        // Update pesan goodbye
        await Group.updateSetting(id, 'goodbye_message', psn);
        
        // Kirim konfirmasi
        await sock.sendMessage(id, {
            text: `✅ *Pesan goodbye berhasil diperbarui!*\n\n*Pesan baru:*\n${psn}\n\n_Catatan: Pastikan fitur goodbye diaktifkan dengan perintah .settings goodbye on_`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Goodbye Message Updated',
                    body: 'Successfully updated goodbye message',
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
