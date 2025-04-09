import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = 'islamqa'
export const description = 'Tanya jawab seputar Islam dengan AI'

const helpText = `⚡ *ISLAMIC Q&A ASSISTANT* ⚡

*1. Tanya Jawab Fiqih*
▸ .islamqa fiqh <pertanyaan>
  Contoh: .islamqa fiqh bagaimana cara tayamum yang benar

*2. Sejarah Islam*
▸ .islamqa history <topik>
  Contoh: .islamqa history perang badar

*3. Adab & Akhlak*
▸ .islamqa adab <topik>
  Contoh: .islamqa adab adab makan dalam islam

*4. Doa & Dzikir*
▸ .islamqa doa <situasi>
  Contoh: .islamqa doa doa sebelum belajar

*5. Kisah Inspiratif*
▸ .islamqa story <tokoh/kejadian>
  Contoh: .islamqa story kisah nabi yusuf

*Catatan:*
• Jawaban bersumber dari Al-Quran & Hadits
• Disertai dalil jika tersedia
• Mengutamakan pendapat mayoritas ulama
• Bahasa yang mudah dipahami

_Powered by Kanata-V3_`;

// Template prompts untuk Gemini
const prompts = {
    fiqh: (question) => `Jawab pertanyaan fiqih berikut dengan format yang terstruktur:
"${question}"

Format jawaban:
1. Hukum/ketentuan
2. Dalil dari Al-Quran dan/atau Hadits (jika ada)
3. Pendapat ulama (sebutkan sumbernya)
4. Hikmah/manfaat
5. Catatan tambahan (jika ada)

Gunakan bahasa Indonesia yang mudah dipahami dan sertakan sumber yang jelas.`,

    history: (topic) => `Jelaskan tentang sejarah Islam berikut:
"${topic}"

Format:
1. Latar belakang kejadian
2. Waktu dan tempat
3. Tokoh-tokoh penting
4. Kronologi peristiwa
5. Hikmah/pelajaran yang bisa diambil

Sertakan sumber referensi yang terpercaya.`,

    adab: (topic) => `Jelaskan tentang adab/akhlak berikut dalam Islam:
"${topic}"

Format:
1. Pengertian dan pentingnya
2. Dalil-dalil terkait
3. Praktik/penerapan
4. Manfaat mengamalkan
5. Tips menerapkan dalam kehidupan sehari-hari

Gunakan referensi dari Al-Quran, Hadits, dan pendapat ulama.`,

    doa: (situation) => `Berikan informasi tentang doa berikut:
"${situation}"

Format:
1. Lafaz doa dalam Arab
2. Latin/cara baca
3. Arti/terjemahan
4. Waktu/situasi membaca
5. Keutamaan/fadhilah

Sertakan sumber doa (Hadits/riwayat) jika ada.`,

    story: (topic) => `Ceritakan kisah inspiratif berikut dalam Islam:
"${topic}"

Format:
1. Tokoh utama dan latar belakang
2. Kronologi cerita
3. Ujian/tantangan yang dihadapi
4. Cara mengatasi
5. Hikmah/pelajaran yang bisa diambil

Fokus pada nilai-nilai dan pelajaran yang bisa diterapkan.`
};

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Islamic Q&A 乂',
                    body: 'Ask anything about Islam',
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
        const [command, ...args] = psn.split(' ');
        
        // Inisialisasi Gemini AI
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini2);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        let prompt;
        let title;
        let topic;

        switch (command) {
            case 'fiqh':
                topic = args.join(' ');
                prompt = prompts.fiqh(topic);
                title = 'Tanya Jawab Fiqih';
                break;
            case 'history':
                topic = args.join(' ');
                prompt = prompts.history(topic);
                title = 'Sejarah Islam';
                break;
            case 'adab':
                topic = args.join(' ');
                prompt = prompts.adab(topic);
                title = 'Adab & Akhlak';
                break;
            case 'doa':
                topic = args.join(' ');
                prompt = prompts.doa(topic);
                title = 'Doa & Dzikir';
                break;
            case 'story':
                topic = args.join(' ');
                prompt = prompts.story(topic);
                title = 'Kisah Inspiratif';
                break;
            default:
                throw new Error('Command tidak valid! Gunakan: fiqh, history, adab, doa, atau story');
        }

        if (!topic) {
            throw new Error('Topik/pertanyaan tidak boleh kosong!');
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const message = `╭─「 *${title.toUpperCase()}* 」
├ *Topik:* ${topic}
│
${response.split('\n').map(line => '├ ' + line).join('\n')}
╰──────────────────

_Powered by Kanata-V3_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Islamic Q&A 乂',
                    body: title,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sesuai command
        const reactions = {
            fiqh: '📚',
            history: '🕌',
            adab: '🤲',
            doa: '📿',
            story: '📖'
        };

        await sock.sendMessage(id, {
            react: {
                text: reactions[command] || '✨',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .islamqa untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Islamic Q&A Error',
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