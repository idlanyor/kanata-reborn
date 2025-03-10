
export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { 
                text: `❌ Format salah!\n\nCara penggunaan:\n!jodoh nama1|nama2\n\nContoh:\n!jodoh Romeo|Juliet` 
            });
            return;
        }

        const [nama1, nama2] = psn.split('|').map(n => n.trim());
        if (!nama1 || !nama2) {
            await sock.sendMessage(id, { 
                text: '❌ Masukkan dua nama untuk dihitung kecocokannya!' 
            });
            return;
        }

        // Hitung kecocokan (random tapi konsisten untuk pasangan nama yang sama)
        const seed = nama1.toLowerCase() + nama2.toLowerCase();
        const hash = seed.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const matchPercent = Math.abs(hash % 101); // 0-100

        // Generate love meter
        const meterLength = 20;
        const filledHearts = Math.round((matchPercent / 100) * meterLength);
        const meter = '❤️'.repeat(filledHearts) + '🖤'.repeat(meterLength - filledHearts);

        let message = `*💘 LOVE METER*\n\n`;
        message += `${nama1} ❤️ ${nama2}\n\n`;
        message += `${meter}\n`;
        message += `Kecocokan: ${matchPercent}%\n\n`;

        // Tambah komentar berdasarkan persentase
        if (matchPercent >= 80) {
            message += '✨ Wah! Kalian sangat cocok!';
        } else if (matchPercent >= 60) {
            message += '💫 Hmm... Ada chemistry nih!';
        } else if (matchPercent >= 40) {
            message += '🌟 Masih ada harapan...';
        } else {
            message += '💔 Mungkin belum jodoh...';
        }

        await sock.sendMessage(id, { text: message });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'jodoh';
export const tags = ['fun'];
export const command = ['jodoh', 'match'];
export const help = 'Cek kecocokan jodoh\nPenggunaan: !jodoh nama1|nama2'; 