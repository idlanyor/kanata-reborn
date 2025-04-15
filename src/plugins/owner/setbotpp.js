import { downloadMediaMessage } from '@fizzxydev/baileys-pro';

export const handler = [ 'setpp'];
export const description = 'Mengubah foto profil bot';

export default async ({ sock, m, id, noTel, attf }) => {
    try {
        // Cek apakah pengirim adalah owner
        if (!m.isOwner) {
            await sock.sendMessage(id, { 
                text: '❌ Fitur ini hanya untuk owner bot!' 
            });
            return;
        }

        // Cek apakah ada gambar yang di-reply atau dikirim langsung
        let media;
        
        if (Buffer.isBuffer(attf)) {
            // Jika gambar dikirim langsung dengan caption
            media = attf;
        } else if (m.quoted && (m.quoted.type === 'imageMessage')) {
            // Jika reply gambar
            media = await m.quoted.download();
        } else {
            await sock.sendMessage(id, { 
                text: '❌ Kirim gambar dengan caption .setpp atau reply gambar dengan .setpp' 
            });
            return;
        }

        // Update foto profil bot
        await sock.updateProfilePicture(sock.user.id, media);

        // Kirim pesan konfirmasi
        await sock.sendMessage(id, {
            text: `*FOTO PROFIL BOT DIUBAH ✨*\n\n` +
                  `_Diubah oleh @${noTel}_`,
            mentions: [`${noTel}@s.whatsapp.net`],
            contextInfo: {
                externalAdReply: {
                    title: '✨ Profile Picture Updated',
                    body: 'Bot Profile Picture has been updated',
                    thumbnailUrl: await sock.profilePictureUrl(sock.user.id, 'image'),
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '✨',
                key: m.key
            }
        });

    } catch (error) {
        console.error('Error in set bot pp:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan: ${error.message}` 
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