// export const handler = "quiz";
// export const description = "🎮 Quiz berbagai kategori yang seru!";

// // Simpan state quiz dalam Map
// const quizSessions = new Map();

// const categories = {
//     'umum': 'Pengetahuan Umum',
//     'sains': 'Sains & Teknologi',
//     'sejarah': 'Sejarah Indonesia',
//     'geo': 'Geografi',
//     'math': 'Matematika'
// };

// export default async ({ sock, m, id, psn, sender }) => {
//     const userId = sender.split('@')[0];

//     if (!psn) {
//         await sock.sendMessage(id, {
//             text: `🎮 Quiz Game!

// *.quiz [kategori]*
// Kategori tersedia:
// ${Object.entries(categories).map(([code, name]) => `• ${code} = ${name}`).join('\n')}

// *.quiz stop* = Hentikan quiz
// *.quiz score* = Lihat score`
//         });
//         return;
//     }

//     try {
//         const command = psn.toLowerCase().trim();

//         // Handle commands
//         if (command === 'stop') {
//             quizSessions.delete(userId);
//             await sock.sendMessage(id, { text: '❌ Quiz dihentikan!' });
//             return;
//         }

//         if (command === 'score') {
//             const session = quizSessions.get(userId);
//             if (!session) {
//                 await sock.sendMessage(id, { text: '❌ Kamu belum mulai quiz!' });
//                 return;
//             }
//             await sock.sendMessage(id, { 
//                 text: `📊 Score kamu: ${session.score}/${session.totalQuestions}` 
//             });
//             return;
//         }

//         // Generate soal baru dengan Gemini
//         const prompt = `Berikan 1 soal quiz ${categories[command] || 'pengetahuan umum'} dengan format:

// Pertanyaan: [soal]
// A. [pilihan A]
// B. [pilihan B]
// C. [pilihan C]
// D. [pilihan D]
// Jawaban: [A/B/C/D]
// Penjelasan: [penjelasan jawaban]

// Pastikan soal menarik dan edukatif!`;

//         const model = globalThis.genAI.getGenerativeModel({ 
//             model: "gemini-2.0-flash-lite"
//         });

//         const result = await model.generateContent(prompt);
//         const quizContent = result.response.text();

//         // Parse quiz content
//         const [question, ...choices] = quizContent.split('\n');
//         const answer = choices.find(c => c.startsWith('Jawaban:'))?.split(': ')[1];
//         const explanation = choices.find(c => c.startsWith('Penjelasan:'))?.split(': ')[1];

//         // Simpan session
//         quizSessions.set(userId, {
//             answer,
//             explanation,
//             score: 0,
//             totalQuestions: 1
//         });

//         // Kirim soal
//         await sock.sendMessage(id, {
//             text: `${question}\n${choices.slice(0,4).join('\n')}\n\nBalas dengan huruf jawaban (A/B/C/D)!`
//         });

//     } catch (error) {
//         console.error("Error in quiz:", error);
//         await sock.sendMessage(id, { 
//             text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏" 
//         });
//     }
// }; 