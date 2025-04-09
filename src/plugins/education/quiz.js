import { decode } from 'html-entities';

export const handler = 'quiz'
export const description = 'Kuis edukasi interaktif berbagai kategori'

// Simpan state kuis aktif
const activeQuizzes = new Map();

const categories = {
    'science': 17,
    'computers': 18,
    'math': 19,
    'history': 23,
    'geography': 22,
    'art': 25
};

const helpText = `⚡ *KUIS EDUKASI* ⚡

*Mulai Kuis:*
▸ .quiz start <kategori>

*Kategori Tersedia:*
• science - Sains & Teknologi
• computers - Komputer & IT
• math - Matematika
• history - Sejarah
• geography - Geografi
• art - Seni & Budaya

*Cara Menjawab:*
Ketik angka 1-4 sesuai pilihan jawaban

*Contoh:*
.quiz start science

_Powered by Kanata-V3_`;

async function fetchQuestion(category) {
    const response = await fetch(`https://opentdb.com/api.php?amount=1&category=${categories[category]}&type=multiple`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        const question = data.results[0];
        
        // Decode HTML entities
        question.question = decode(question.question);
        question.correct_answer = decode(question.correct_answer);
        question.incorrect_answers = question.incorrect_answers.map(a => decode(a));
        
        // Acak posisi jawaban
        const answers = [...question.incorrect_answers, question.correct_answer];
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        
        return {
            question: question.question,
            answers,
            correctIndex: answers.indexOf(question.correct_answer)
        };
    }
    throw new Error('Gagal mengambil pertanyaan.');
}

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Educational Quiz 乂',
                    body: 'Test your knowledge!',
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
        const [command, category] = psn.toLowerCase().split(' ');

        if (command === 'start') {
            if (!category || !categories[category]) {
                throw new Error('Kategori tidak valid! Gunakan .quiz untuk melihat kategori yang tersedia.');
            }

            const quizData = await fetchQuestion(category);
            activeQuizzes.set(id, quizData);

            const message = `╭─「 *KUIS ${category.toUpperCase()}* 」
├ *Pertanyaan:*
├ ${quizData.question}
│
├ *Pilihan:*
${quizData.answers.map((answer, i) => `├ ${i + 1}. ${answer}`).join('\n')}
│
├ Ketik angka 1-4 untuk menjawab
╰──────────────────

_Powered by Kanata-V3_`;

            await sock.sendMessage(id, {
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 Quiz Time! 乂',
                        body: category.toUpperCase(),
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

        } else {
            // Cek jawaban
            const answer = parseInt(psn);
            if (isNaN(answer) || answer < 1 || answer > 4) return;

            const quizData = activeQuizzes.get(id);
            if (!quizData) return;

            const isCorrect = answer - 1 === quizData.correctIndex;
            const correctAnswer = quizData.answers[quizData.correctIndex];

            const message = `╭─「 *HASIL KUIS* 」
├ *Status:* ${isCorrect ? '✅ BENAR!' : '❌ SALAH!'}
├ *Jawaban Benar:* ${correctAnswer}
╰──────────────────

_Powered by Kanata-V3_`;

            await sock.sendMessage(id, {
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 Quiz Result 乂',
                        body: isCorrect ? 'Correct Answer!' : 'Wrong Answer!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

            // Kirim reaksi
            await sock.sendMessage(id, {
                react: {
                    text: isCorrect ? '🎯' : '❌',
                    key: m.key
                }
            });

            // Hapus kuis dari state
            activeQuizzes.delete(id);
        }

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .quiz untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Quiz Error',
                    body: 'An error occurred while fetching quiz',
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