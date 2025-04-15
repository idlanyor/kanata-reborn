import User from '../../database/models/User.js';
import { getPpUrl } from "../../helper/bot.js";

export const handler = ['setbio'];
export const description = 'Mengatur biodata profil';

export default async ({ sock, m, id, psn, noTel }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, {
                text: `*🎯 PENGATURAN BIODATA*

Gunakan format berikut:
.setbio [tipe] [isi]

*Tipe yang tersedia:*
• nickname - Nama panggilan
• gender - Jenis kelamin (L/P)
• religion - Agama
• city - Kota
• birthdate - Tanggal lahir (YYYY-MM-DD)
• hobby - Hobi
• bio - Bio/status

*Contoh:*
.setbio nickname Roy
.setbio gender L
.setbio city Jakarta
.setbio birthdate 2000-01-01
.setbio hobby Ngoding
.setbio bio Suka ngoding sambil ngopi`
            });
            return;
        }

        const [type, ...value] = psn.split(' ');
        const bioValue = value.join(' ');

        if (!['nickname', 'gender', 'religion', 'city', 'birthdate', 'hobby', 'bio'].includes(type)) {
            throw new Error('Tipe biodata tidak valid!');
        }

        // Validasi khusus
        if (type === 'gender' && !['L', 'P'].includes(bioValue)) {
            throw new Error('Gender harus L atau P');
        }
        if (type === 'birthdate' && !bioValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Format tanggal lahir harus YYYY-MM-DD');
        }

        // Update biodata
        await User.updateBio(noTel, type, bioValue);

        await sock.sendMessage(id, {
            text: `✅ Berhasil mengubah ${type} menjadi: ${bioValue}`,
            contextInfo: {
                externalAdReply: {
                    title: '✏️ Biodata Updated',
                    body: `${type} has been updated`,
                    thumbnailUrl: await getPpUrl(sock, noTel),
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
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
        await sock.sendMessage(id, { 
            text: `❌ ${error.message}` 
        });
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
}; 