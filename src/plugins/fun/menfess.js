import { formatPhoneNumber } from '../../helper/formatter.js';
import db from '../../database/config.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, {
                text: `❌ Format salah!\n\nCara penggunaan:\n!menfess 628xxx|pesan\n\nContoh:\n!menfess 6281234567890|Hai, kamu cantik deh`
            });
            return;
        }

        const [targetNumber, ...messageArr] = psn.split('|');
        const message = messageArr.join('|').trim();

        // Validasi nomor tujuan
        if (!targetNumber || !message) {
            await sock.sendMessage(id, {
                text: '❌ Format salah! Masukkan nomor tujuan dan pesan.'
            });
            return;
        }

        // Format nomor telepon
        const formattedNumber = formatPhoneNumber(targetNumber);

        // Cek apakah nomor valid
        if (!formattedNumber) {
            await sock.sendMessage(id, {
                text: '❌ Nomor tidak valid!'
            });
            return;
        }

        // Cek apakah mengirim ke diri sendiri
        if (formattedNumber === noTel) {
            await sock.sendMessage(id, {
                text: '❌ Tidak bisa mengirim menfess ke diri sendiri!'
            });
            return;
        }

        // Kirim pesan ke target
        const targetId = `${formattedNumber}@s.whatsapp.net`;
        await sock.sendMessage(targetId, {
            text: `*💌 MENFESS*\n\nAda pesan rahasia buat kamu nih:\n\n"${message}"\n\n_Balas dengan !balas <pesan> untuk membalas pesan ini_`
        });

        // Simpan pesan ke database
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO messages (type, sender_id, receiver_id, message,is_anonymous) 
                VALUES (?, ?, ?, ?,?)`,
                ['menfess', noTel, formattedNumber, message, 0],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Konfirmasi ke pengirim
        await sock.sendMessage(id, {
            text: '✅ Menfess berhasil dikirim!'
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Error: ${error.message}`
        });
    }
};

export const handler = 'menfess';
export const tags = ['fun'];
export const command = ['menfess', 'menfes'];
export const help = 'Kirim pesan rahasia ke seseorang\nPenggunaan: !menfess nomor|pesan'; 