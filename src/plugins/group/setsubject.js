export const handler = ['setsubject', 'setname', 'setnama', 'subject', 'nama'];
export const description = 'Mengganti nama grup';

export default async ({ sock, m, id, psn, noTel }) => {
    try {
        // Cek apakah pesan dari grup
        if (!id.endsWith('@g.us')) {
            await sock.sendMessage(id, { 
                text: '❌ Perintah ini hanya bisa digunakan di dalam grup!' 
            });
            return;
        }

        // Cek apakah ada nama yang akan diset
        if (!psn) {
            await sock.sendMessage(id, { 
                text: '❌ Masukkan nama grup baru!\n\n' +
                      '📝 Contoh: .setsubject Grup Keren' 
            });
            return;
        }

        // Cek apakah pengirim adalah admin
        const groupMetadata = await sock.groupMetadata(id);
        const participants = groupMetadata.participants;
        
        // Cek status admin pengirim
        const isAdmin = participants.find(p => p.id.split('@')[0] === noTel)?.admin === 'admin';
        // Cek status admin bot
        const isBotAdmin = participants.find(p => p.id.split('@')[0] === sock.user.id.split(':')[0])?.admin === 'admin';

        if (!isAdmin) {
            await sock.sendMessage(id, { 
                text: '❌ Kamu bukan admin grup!' 
            });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(id, { 
                text: '❌ Bot harus menjadi admin untuk menggunakan fitur ini!' 
            });
            return;
        }

        // Ambil nama grup lama
        const oldName = groupMetadata.subject;
        
        // Set nama grup baru
        await sock.groupUpdateSubject(id, psn);

        // Ambil foto grup
        const ppgroup = await sock.profilePictureUrl(id, 'image').catch(_ => 'https://files.catbox.moe/2wynab.jpg');

        // Kirim pesan konfirmasi
        await sock.sendMessage(id, {
            text: `*NAMA GRUP DIUBAH ✏️*\n\n` +
                  `📝 *Nama Lama:* ${oldName}\n` +
                  `📝 *Nama Baru:* ${psn}\n\n` +
                  `_Diubah oleh @${noTel}_`,
            mentions: [`${noTel}@s.whatsapp.net`],
            contextInfo: {
                externalAdReply: {
                    title: `✏️ Grup Berhasil Diubah`,
                    body: psn,
                    thumbnailUrl: ppgroup,
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '✏️',
                key: m.key
            }
        });

    } catch (error) {
        console.error('Error in set subject:', error);
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