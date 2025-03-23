export const handler = 'kick'
export const description = 'Mengeluarkan anggota dari group'

export default async ({ sock, m, id, psn }) => {
    try {
        // Cek apakah di grup
        if (!m.isGroup) {
            await m.reply('⚠️ Perintah ini hanya dapat digunakan di dalam grup!');
            return;
        }

        // Cek apakah bot admin
        if (!await m.isBotAdmin) {
            await m.reply('❌ Bot harus menjadi admin untuk mengeluarkan member!');
            return;
        }

        // Cek apakah pengirim adalah admin
        if (!await m.isAdmin) {
            await m.reply('❌ Perintah ini hanya untuk admin grup!');
            return;
        }

        // Dapatkan user yang akan di-kick
        let userToKick = '';
        
        // Cek jika ada mention
        if (psn) {
            userToKick = psn.replace('@', '') + '@s.whatsapp.net';
        } 
        // Cek jika ada reply
        else if (m.quoted) {
            userToKick = m.quoted.sender;
        } 
        // Jika tidak ada mention atau reply
        else {
            await m.reply({
                text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.kick @user*\natau reply pesan dengan *.kick*\n\n📌 Contoh:\n*.kick @user*',
                contextInfo: {
                    externalAdReply: {
                        title: '乂 Group Manager 乂',
                        body: 'Kick member from group',
                        thumbnailUrl: globalThis.thumbnailUrl,
                        sourceUrl: globalThis.sourceUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            return;
        }

        // Proses kick member
        await sock.groupParticipantsUpdate(id, [userToKick], 'remove');

        // Dapatkan nama yang di-kick untuk pesan konfirmasi
        const kickedName = psn ? psn.trim() : (m.quoted ? `@${m.quoted.sender.split('@')[0]}` : 'user');

        await m.reply({
            text: `✅ Berhasil mengeluarkan *${kickedName}* dari grup!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Kicked',
                    body: 'Successfully removed member',
                    thumbnailUrl: globalThis.thumbnailUrl,
                    sourceUrl: globalThis.sourceUrl,
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi sukses
        await m.react('👢');

    } catch (error) {
        await m.reply({
            text: `❌ *Gagal mengeluarkan member:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Kick',
                    body: 'An error occurred',
                    thumbnailUrl: globalThis.thumbnailUrl,
                    sourceUrl: globalThis.sourceUrl,
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi error
        await m.react('❌');
    }
};

export const help = {
    name: 'kick',
    description: 'Mengeluarkan anggota dari group',
    usage: '.kick @user'
};