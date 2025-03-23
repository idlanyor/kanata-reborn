export const handler = 'add'
export const description = 'Menambahkan anggota ke dalam group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        // Cek apakah di grup
        if (!m.isGroup) {
            await sock.sendMessage(id, { text: '⚠️ Perintah ini hanya dapat digunakan di dalam grup!' });
            return;
        }

        // Cek apakah bot admin
        const groupMetadata = await sock.groupMetadata(id);
        const participants = groupMetadata.participants || [];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === sock.user.id.split('@')[0] && p.admin);

        if (!isBotAdmin) {
            await sock.sendMessage(id, { text: '❌ Bot harus menjadi admin untuk menambahkan member!' });
            return;
        }

        // Variabel untuk menyimpan nomor yang akan ditambahkan
        let numberToAdd = '';
        let userName = '';

        // Cek jika ada mention
        if (psn) {
            numberToAdd = psn.replace('@', '') + '@s.whatsapp.net';
            userName = psn.trim();
        }
        // Cek jika ada reply vCard
        else if (m.quoted && m.quoted.type === 'vcard') {
            const vcard = m.quoted.vcard;
            const match = vcard.match(/waid=(\d+)/);
            if (match && match[1]) {
                numberToAdd = match[1] + '@s.whatsapp.net';
                // Coba ambil nama dari vCard
                const nameMatch = vcard.match(/FN:(.*)/);
                userName = nameMatch && nameMatch[1] ? nameMatch[1] : numberToAdd.split('@')[0];
            }
        }
        // Jika tidak ada mention atau vCard yang valid
        else {
            await sock.sendMessage(id, { 
                text: '⚠️ *Format Salah!*\n\n📝 Gunakan:\n*.add @user*\natau reply vCard dengan *.add*\n\n📌 Contoh:\n*.add @user*',
                contextInfo: {
                    externalAdReply: {
                        title: '乂 Group Manager 乂',
                        body: 'Add member to group',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            return;
        }

        if (!numberToAdd) {
            await sock.sendMessage(id, { text: '❌ Tidak dapat mendeteksi nomor dari vCard yang di-reply!' });
            return;
        }

        // Proses penambahan member
        // let res = await sock.groupParticipantsUpdate(id, [numberToAdd], 'add');
        
        await sock.sendMessage(id, { 
            text: `✅ Berhasil menambahkan *${userName}* ke dalam grup!`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Member Added',
                    body: 'Successfully added new member',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '✅', 
                key: m.key 
            } 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *Gagal menambahkan member:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Failed to Add',
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

export const help = {
    name: 'add',
    description: 'Menambahkan anggota ke dalam group',
    usage: '.add @user atau reply vCard dengan .add'
};