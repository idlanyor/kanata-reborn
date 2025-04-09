import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = 'study'
export const description = 'Asisten belajar pintar dengan Gemini AI'

const helpText = `⚡ *STUDY ASSISTANT* ⚡

*1. Penjelasan Materi*
▸ .study explain <topik>
  Contoh: .study explain pythagoras theorem

*2. Latihan Soal*
▸ .study exercise <topik> <level>
  Contoh: .study exercise algebra medium

*3. Rangkuman*
▸ .study summary <topik>
  Contoh: .study summary photosynthesis

*4. Tips & Trik*
▸ .study tips <topik>
  Contoh: .study tips chemistry

*Level Kesulitan:*
• easy - Mudah
• medium - Sedang
• hard - Sulit

_Powered by Gemini AI_`;

// Template prompts untuk Gemini
const prompts = {
    explain: (topic) => `Jelaskan tentang "${topic}" dengan format berikut:
1. Pengertian dasar
2. Konsep penting
3. Contoh penerapan
4. Visualisasi (jika relevan)

Gunakan bahasa yang mudah dipahami dan berikan contoh yang konkret.`,

    exercise: (topic, level) => `Buatkan 1 soal tentang "${topic}" dengan level kesulitan "${level}".
Format:
1. Soal (dengan konteks yang jelas)
2. Pilihan jawaban (A-D)
3. Jawaban benar
4. Pembahasan detail

Gunakan bahasa Indonesia yang baik dan berikan soal yang menarik.`,

    summary: (topic) => `Buatkan rangkuman singkat tentang "${topic}" dengan format:
1. Poin-poin utama (maksimal 5 poin)
2. Kata kunci penting
3. Hubungan antar konsep
4. Aplikasi dalam kehidupan sehari-hari

Buat seringkas dan sejelas mungkin.`,

    tips: (topic) => `Berikan tips dan trik belajar untuk memahami "${topic}" dengan baik:
1. Strategi belajar efektif
2. Cara mengingat konsep penting
3. Latihan yang disarankan
4. Sumber belajar tambahan

Fokus pada tips praktis yang bisa langsung diterapkan.`
};

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Study Assistant 乂',
                    body: 'Your Personal Learning Assistant',
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
            case 'explain':
                topic = args.join(' ');
                prompt = prompts.explain(topic);
                title = 'Penjelasan Materi';
                break;
            case 'exercise':
                const [exerciseTopic, level = 'medium'] = [args.slice(0, -1).join(' '), args[args.length - 1]];
                if (!['easy', 'medium', 'hard'].includes(level)) {
                    throw new Error('Level kesulitan tidak valid! Gunakan: easy, medium, atau hard');
                }
                topic = exerciseTopic;
                prompt = prompts.exercise(exerciseTopic, level);
                title = `Latihan Soal (${level.toUpperCase()})`;
                break;
            case 'summary':
                topic = args.join(' ');
                prompt = prompts.summary(topic);
                title = 'Rangkuman';
                break;
            case 'tips':
                topic = args.join(' ');
                prompt = prompts.tips(topic);
                title = 'Tips & Trik';
                break;
            default:
                throw new Error('Command tidak valid! Gunakan: explain, exercise, summary, atau tips');
        }

        if (!topic) {
            throw new Error('Topik tidak boleh kosong!');
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const message = `╭─「 *${title.toUpperCase()}* 」
├ *Topik:* ${topic}
│
${response.split('\n').map(line => '├ ' + line).join('\n')}
╰──────────────────

_Powered by Gemini AI_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Study Assistant 乂',
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
            explain: '📚',
            exercise: '✍️',
            summary: '📝',
            tips: '💡'
        };

        await sock.sendMessage(id, {
            react: {
                text: reactions[command] || '✨',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .study untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Study Assistant Error',
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