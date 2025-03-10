import db from "../../database/config.js";
export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { 
                text: '❌ Masukkan pesan balasan!' 
            });
            return;
        }

        // Cek pesan menfess terakhir yang diterima
        const lastMessage = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM messages 
                WHERE type = 'menfess' 
                AND receiver_id = ? 
                ORDER BY timestamp DESC LIMIT 1`,
                [noTel],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!lastMessage) {
            await sock.sendMessage(id, { 
                text: '❌ Tidak ada pesan menfess yang bisa dibalas!' 
            });
            return;
        }

        // Kirim balasan ke pengirim asli
        const senderId = `${lastMessage.sender_id}@s.whatsapp.net`;
        await sock.sendMessage(senderId, { 
            text: `*💌 BALASAN MENFESS*\n\nPesan asli:\n"${lastMessage.message}"\n\nBalasan:\n"${psn}"` 
        });

        // Simpan balasan ke database
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO messages (type, sender_id, receiver_id, message, is_anonymous) 
                VALUES (?, ?, ?, ?, ?)`,
                ['reply', noTel, lastMessage.sender_id, psn, 0],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        await sock.sendMessage(id, { 
            text: '✅ Balasan terkirim!' 
        });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'balas';
export const tags = ['fun'];
export const command = ['balas', 'reply'];
export const help = 'Balas pesan menfess\nPenggunaan: !balas pesan'; 