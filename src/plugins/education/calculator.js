import * as math from 'mathjs';

export const handler = 'calc'
export const description = 'Kalkulator pintar untuk perhitungan dan konversi'

const helpText = `⚡ *KALKULATOR PINTAR* ⚡

*1. Perhitungan Dasar*
▸ .calc 2 + 2
▸ .calc 5 * (3 + 2)
▸ .calc 10 / 2

*2. Konversi Satuan*
▸ .calc 5 cm to inch
▸ .calc 30 celsius to fahrenheit
▸ .calc 1 kg to pound
▸ .calc 100 km/h to mph

*3. Fungsi Matematika*
▸ .calc sin(45 deg)
▸ .calc cos(60 deg)
▸ .calc sqrt(16)
▸ .calc log(100)

*4. Perhitungan Finansial*
▸ .calc 5% of 1000000
▸ .calc 1000000 * 1.1^12

*Tips:*
• Gunakan 'to' untuk konversi
• Gunakan 'deg' untuk derajat
• Bisa pakai operator: + - * / ^ %
• Bisa pakai fungsi: sin, cos, tan, log, sqrt

_Powered by Kanata-V3_`;

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Smart Calculator 乂',
                    body: 'Powered by mathjs',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    try {
        // Evaluasi ekspresi matematika
        const result = math.evaluate(psn);
        
        // Format hasil dengan benar
        let formattedResult;
        if (typeof result === 'number') {
            // Jika hasilnya angka, format dengan maksimal 4 desimal
            formattedResult = math.format(result, { precision: 4 });
        } else if (result.toString().includes('unit')) {
            // Jika hasilnya unit (konversi), ambil nilai numeriknya
            formattedResult = result.toString();
        } else {
            formattedResult = result.toString();
        }

        const message = `╭─「 *HASIL PERHITUNGAN* 」
├ *Input:* ${psn}
├ *Result:* ${formattedResult}
╰──────────────────

_Powered by mathjs_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Smart Calculator 乂',
                    body: 'Powered by mathjs',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
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
            text: '❌ Error: ' + error.message + '\n\nGunakan .calc untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Calculation Error',
                    body: 'An error occurred while calculating',
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