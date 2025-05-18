export const handler = ['open', 'close', 'buka', 'tutup'];
export const description = 'Buka atau tutup grup';

export default async ({ sock, m, id, cmd, noTel }) => {
    try {
        // Cek apakah pesan dari grup
        if (!id.endsWith('@g.us')) {
            await sock.sendMessage(id, {
                text: '❌ Perintah ini hanya bisa digunakan di dalam grup!'
            });
            return;
        }

        // Cek apakah pengirim adalah admin
        const groupMetadata = await sock.groupMetadata(id);
        const participants = groupMetadata.participants;

        // Cek status admin pengirim
        // Cek status admin bot
        const isBotAdmin = participants.find(p => p.id.split('@')[0] === sock.user.id.split(':')[0])?.admin === 'admin' || participants.find(p => p.id.split('@')[0] === sock.user.id.split(':')[0])?.admin === 'superadmin';
        console.log(participants)
        if (!m.isAdmin) {
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

        // Set grup berdasarkan command
        const isClose = cmd === 'close' || cmd === 'tutup';

        try {
            await sock.groupSettingUpdate(id, isClose ? 'announcement' : 'not_announcement');
        } catch (settingError) {
            console.error('Error updating group settings:', settingError);
            throw new Error('Gagal mengubah pengaturan grup. Pastikan bot adalah admin!');
        }

        // Ambil foto grup
        const ppgroup = await sock.profilePictureUrl(id, 'image').catch(_ => 'https://files.catbox.moe/2wynab.jpg');

        // Kirim pesan konfirmasi
        await sock.sendMessage(id, {
            text: `*${isClose ? 'GRUP DITUTUP 🔒' : 'GRUP DIBUKA 🔓'}*\n\n` +
                `Sekarang ${isClose ? 'hanya admin yang dapat mengirim pesan' : 'semua peserta dapat mengirim pesan'} di grup ini`,
            contextInfo: {
                externalAdReply: {
                    title: `${groupMetadata.subject}`,
                    body: `${isClose ? 'Group Closed 🔒' : 'Group Opened 🔓'}`,
                    thumbnailUrl: ppgroup,
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi
        await sock.sendMessage(id, {
            react: {
                text: isClose ? '🔒' : '🔓',
                key: m.key
            }
        });

    } catch (error) {
        console.error('Error in group setting:', error);
        await sock.sendMessage(id, {
            text: `❌ ${error.message}`
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