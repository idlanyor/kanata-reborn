import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = 'dict'
export const description = 'Kamus Inggris-Indonesia dengan Gemini AI'

const helpText = `⚡ *KAMUS INGGRIS-INDONESIA* ⚡

*Penggunaan:*
▸ .dict <kata>
  Contoh: .dict hello

*Fitur:*
• Arti kata dalam Bahasa Indonesia
• Jenis kata (kata benda, kata kerja, dll)
• Contoh penggunaan
• Sinonim (jika ada)

_Powered by Gemini AI_`;

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 English-Indonesian Dictionary 乂',
                    body: 'Powered by Gemini AI',
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
        const word = psn.toLowerCase().trim();
        
        // Inisialisasi Gemini AI
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini2);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // Buat prompt untuk Gemini
        const prompt = `Berikan definisi kata "${word}" dari bahasa yang dideteksi ke dalam Bahasa Indonesia dengan format berikut:
1. Jenis kata (noun/verb/adjective dll)
2. Arti kata
3. Contoh penggunaan dalam kalimat
4. Sinonim (jika ada)

Format output:
TYPE: [jenis kata]
MEANING: [arti]
EXAMPLE: [contoh]
SYNONYMS: [sinonim]`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse response
        const lines = response.split('\n');
        const definition = {
            type: lines.find(l => l.startsWith('TYPE:'))?.split(':')[1]?.trim() || 'Unknown',
            meaning: lines.find(l => l.startsWith('MEANING:'))?.split(':')[1]?.trim() || 'Tidak ditemukan',
            example: lines.find(l => l.startsWith('EXAMPLE:'))?.split(':')[1]?.trim() || 'Tidak ada contoh',
            synonyms: lines.find(l => l.startsWith('SYNONYMS:'))?.split(':')[1]?.trim() || 'Tidak ada sinonim'
        };

        const message = `╭─「 *HASIL PENCARIAN* 」
├ *Kata:* ${word}
│
├ *Definisi:*
├ (${definition.type}) ${definition.meaning}
├
├ *Contoh:*
├ "${definition.example}"
├
├ *Sinonim:*
├ ${definition.synonyms}
╰──────────────────

_Powered by Gemini AI_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Dictionary Result 乂',
                    body: 'Powered by Gemini AI',
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
                text: '📚',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .dict untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Dictionary Error',
                    body: 'An error occurred while searching',
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