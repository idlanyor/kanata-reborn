import translate from '@vitalets/google-translate-api';

export const handler = 'tr2'
export const description = 'Translator multi bahasa dengan deteksi otomatis'

const helpText = `⚡ *TRANSLATOR* ⚡

*1. Terjemahkan ke Indonesia*
▸ .tr <teks>
  Contoh: .tr how are you

*2. Terjemahkan ke Bahasa Lain*
▸ .tr <kode_bahasa> <teks>
  Contoh: .tr en apa kabar

*Kode Bahasa:*
• id = Indonesia
• en = Inggris
• ar = Arab
• ja = Jepang
• ko = Korea
• es = Spanyol
• de = Jerman
• fr = Prancis
• it = Italia
• ru = Rusia

_Powered by Kanata-V3_`;

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Multi Language Translator 乂',
                    body: 'Powered by Google Translate',
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
        let targetLang = 'id';
        let text = psn;

        // Cek jika ada kode bahasa
        const firstWord = psn.split(' ')[0];
        if (firstWord.length === 2) {
            targetLang = firstWord;
            text = psn.slice(3); // Hapus kode bahasa + spasi
        }

        // Terjemahkan teks
        const result = await translate(text, { to: targetLang });

        const message = `╭─「 *HASIL TERJEMAHAN* 」
├ *Dari:* ${result.from.language.iso.toUpperCase()}
├ *Ke:* ${targetLang.toUpperCase()}
│
├ *Teks Asli:*
├ ${text}
│
├ *Terjemahan:*
├ ${result.text}
╰──────────────────

_Powered by Kanata-V3_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Translation Result 乂',
                    body: 'Powered by Google Translate',
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
                text: '🌐',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .tr untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Translation Error',
                    body: 'An error occurred while translating',
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