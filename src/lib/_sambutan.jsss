import fs from 'fs'

export default async function sambutan({ id, sock, isOwner, sender, ownerGreeted, lastGreetTime, greetInterval, now }) {
    if (isOwner) {
        if (!ownerGreeted || (now - lastGreetTime > greetInterval)) {
            // Kirim pesan sambutana
            await sock.sendMessage(id, {
                document: fs.readFileSync("kanata.docx"), // Path ke file MS Word
                fileName: 'Kanata.docx', // Nama file MS Word
                mimetype: 'application/msword',
                fileLength: 1099511627776,
                jpegThumbnail: fs.readFileSync("kanata.jpg"), // Gambar thumbnail
                caption: "ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴏᴡɴᴇʀᴋᴜ!!"
            }, {
                quoted: {
                    key: {
                        remoteJid: '0@s.whatsapp.net',
                        participant: '0@s.whatsapp.net'
                    },
                    message: {
                        newsletterAdminInviteMessage: {
                            newsletterJid: '120363302865191524@newsletter',
                            newsletterName: '',
                            caption: sender
                        }
                    }
                }
            });

            // Update waktu terakhir kirim pesan dan flag
            lastGreetTime = now;
            ownerGreeted = true;
        }
    }
}