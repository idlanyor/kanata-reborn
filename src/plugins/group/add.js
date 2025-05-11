export const handler = 'add';
export const description = 'Menambahkan anggota ke dalam group';

export default async ({ sock, m, id, psn, sender }) => {
    try {
        // 1. Cek harus di grup
        if (!m.isGroup) {
            return await sock.sendMessage(id, {
                text: '⚠️ Perintah ini cuma bisa dipake di grup, bos. Jangan sotoy di chat pribadi 😒',
            });
        }

        // 2. Cek bot udah admin belum
        if (!await m.isBotAdmin) {
            return await sock.sendMessage(id, {
                text: '❌ Bot belum jadi admin nih bos. Gimana mau nambahin member coba? 😤',
            });
        }

        let numberToAdd = '';
        let userName = '';

        // 3. Kalau ada mention (psn)
        if (psn) {
            const cleanNumber = psn.replace(/[@+ -]/g, ''); // bersihin format mention
            numberToAdd = `${cleanNumber}@s.whatsapp.net`;
            userName = psn;
        }

        // 4. Kalau reply vCard
        else if (m.quoted && m.quoted.message?.contactMessage?.vcard) {
            const vcard = m.quoted.message.contactMessage.vcard;
            const match = vcard.match(/waid=(\d+)/);
            if (match) {
                numberToAdd = `${match[1]}@s.whatsapp.net`;
                const nameMatch = vcard.match(/FN:(.*)/);
                userName = nameMatch?.[1] || match[1];
            } else {
                return await sock.sendMessage(id, {
                    text: '❌ Nomor nggak ketangkep dari vCard-nya bang. Kasih yang bener kek 😑',
                });
            }
        }

        // 5. Kalau gak ada dua-duanya
        else {
            return await sock.sendMessage(id, {
                text: `⚠️ *Formatnya salah bossku!*\n\nGunain:\n➤ *.add @user*\n➤ atau reply vCard pake *.add*`,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 Group Manager 乂',
                        body: 'Add member to group',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            });
        }

        // 6. Eksekusi tambah member
        const res = await sock.groupParticipantsUpdate(id, [numberToAdd], 'add');

        // 7. Cek kalo ditolak
        if (res[0]?.status === 403) {
            return await sock.sendMessage(id, {
                text: `❌ Gagal nambahin *${userName}*. Mungkin privasinya kek mantan lo, gak bisa dimasukin grup sembarangan 😬`,
            });
        }

        // 8. Kalau sukses
        await sock.sendMessage(id, {
            text: `✅ *${userName}* udah resmi jadi warga grup ini 🎉`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Added',
                    body: 'Successfully added new member',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                },
            },
        });

        await sock.sendMessage(id, {
            react: {
                text: '✅',
                key: m.key,
            },
        });

    } catch (error) {
        console.error('❌ Error add member:', error);
        await sock.sendMessage(id, {
            text: `❌ Gagal nambahin member karena error:\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Add',
                    body: 'An error occurred',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                },
            },
        });

        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key,
            },
        });
    }
};

