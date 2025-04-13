// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export const handler = "tebakkata";
// export const description = "Game Tebak Kata";

// // Simpan sesi permainan
// const sessions = {};

// // Kata-kata yang bisa ditebak (tambah lebih banyak sesuai kebutuhan)
// const words = [
//     { word: "komputer", hint: "Alat elektronik untuk mengolah data" },
//     { word: "handphone", hint: "Alat komunikasi yang bisa dibawa kemana-mana" },
//     { word: "internet", hint: "Jaringan komputer global" },
//     { word: "fotografi", hint: "Seni mengambil gambar dengan kamera" },
//     { word: "website", hint: "Kumpulan halaman web yang saling terhubung" },
//     { word: "kecerdasan", hint: "Kemampuan seseorang untuk belajar dan menerapkan pengetahuan" },
//     { word: "pendidikan", hint: "Proses pengajaran dan pembelajaran" },
//     { word: "teknologi", hint: "Penerapan ilmu pengetahuan untuk membuat alat/mesin" },
//     { word: "matematika", hint: "Ilmu tentang bilangan dan perhitungan" },
//     { word: "perpustakaan", hint: "Tempat koleksi buku tersimpan" },
//     { word: "kehutanan", hint: "Ilmu yang berkaitan dengan hutan dan pengelolaannya" },
//     { word: "pertanian", hint: "Kegiatan pemanfaatan sumber daya hayati untuk menghasilkan bahan pangan" },
//     { word: "kesehatan", hint: "Keadaan sejahtera dari badan, jiwa, dan sosial" },
//     { word: "transportasi", hint: "Perpindahan manusia atau barang dari satu tempat ke tempat lainnya" },
//     { word: "pariwisata", hint: "Kegiatan perjalanan yang dilakukan untuk rekreasi" }
// ];

// // Atau load dari file json (opsional)
// const wordsFilePath = path.join(__dirname, '../../assets/words.json');
// let wordList = words;

// try {
//     if (fs.existsSync(wordsFilePath)) {
//         const wordsData = fs.readFileSync(wordsFilePath, 'utf8');
//         wordList = JSON.parse(wordsData);
//     }
// } catch (error) {
//     console.error('Error loading words file:', error);
// }

// // Helper function untuk mengacak array
// function shuffle(array) {
//     const newArray = [...array];
//     for (let i = newArray.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
//     }
//     return newArray;
// }

// // Fungsi untuk memulai sesi baru
// function createSession(id) {
//     const shuffledWords = shuffle(wordList);
//     const wordData = shuffledWords[0];
    
//     // Buat tanda untuk huruf yang sudah ditebak
//     const maskedWord = wordData.word.split('').map(() => '_').join(' ');
    
//     return {
//         word: wordData.word,
//         hint: wordData.hint,
//         maskedWord: maskedWord,
//         attempts: 0,
//         maxAttempts: wordData.word.length + 5,
//         guessedLetters: [],
//         startTime: Date.now(),
//         score: 100
//     };
// }

// // Fungsi untuk memperbarui kata yang dimasking berdasarkan tebakan
// function updateMaskedWord(word, guessedLetters) {
//     return word.split('').map(letter => 
//         guessedLetters.includes(letter.toLowerCase()) ? letter : '_'
//     ).join(' ');
// }

// export default async ({ sock, m, id, psn }) => {
//     // Jika ada perintah 'stop', hentikan permainan
//     if (psn && psn.toLowerCase() === 'stop') {
//         if (sessions[id]) {
//             await sock.sendMessage(id, { 
//                 text: `🎮 *Game Tebak Kata*\n\nPermainan dihentikan!\nJawaban yang benar adalah: *${sessions[id].word}*`
//             });
//             delete sessions[id];
//         } else {
//             await sock.sendMessage(id, { 
//                 text: `🎮 *Game Tebak Kata*\n\nTidak ada permainan yang sedang berlangsung.`
//             });
//         }
//         return;
//     }
    
//     // Cek apakah ada sesi yang sedang berlangsung
//     if (!sessions[id]) {
//         // Tidak ada sesi, mulai permainan baru
//         sessions[id] = createSession(id);
        
//         await sock.sendMessage(id, { 
//             text: `🎮 *Game Tebak Kata*\n\n` +
//                   `Tebak kata berikut ini:\n\n` +
//                   `${sessions[id].maskedWord}\n\n` +
//                   `*Petunjuk:* ${sessions[id].hint}\n\n` +
//                   `Ketik huruf atau langsung jawab dengan kata lengkap.\n` +
//                   `Kesempatan: ${sessions[id].maxAttempts} kali\n\n` +
//                   `Ketik *stop* untuk menyerah.`
//         });
//         return;
//     }
    
//     // Ada sesi yang sedang berlangsung
//     const session = sessions[id];
    
//     // Jika tidak ada input
//     if (!psn) {
//         await sock.sendMessage(id, { 
//             text: `🎮 *Game Tebak Kata*\n\n` +
//                   `Tebak kata: ${session.maskedWord}\n\n` +
//                   `*Petunjuk:* ${session.hint}\n\n` +
//                   `Huruf yang sudah ditebak: ${session.guessedLetters.join(', ') || 'Belum ada'}\n` +
//                   `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali\n\n` +
//                   `Ketik *stop* untuk menyerah.`
//         });
//         return;
//     }
    
//     // Proses tebakan
//     const guess = psn.toLowerCase().trim();
    
//     // Jika menebak kata lengkap
//     if (guess === session.word.toLowerCase()) {
//         // Hitung skor
//         const timeBonus = Math.max(0, 50 - Math.floor((Date.now() - session.startTime) / 1000));
//         const attemptsBonus = Math.max(0, 50 - (session.attempts * 5));
//         const finalScore = Math.min(100, session.score + timeBonus + attemptsBonus);
        
//         await sock.sendMessage(id, { 
//             text: `🎮 *Game Tebak Kata*\n\n` +
//                   `🎉 SELAMAT! Kamu berhasil menebak kata *${session.word}* dengan benar!\n\n` +
//                   `✨ *Skor:* ${finalScore}\n` +
//                   `🕐 *Waktu:* ${Math.floor((Date.now() - session.startTime) / 1000)} detik\n` +
//                   `🔄 *Percobaan:* ${session.attempts + 1} kali\n\n` +
//                   `Ketik *.tebakkata* untuk main lagi!`
//         });
        
//         // Hapus sesi
//         delete sessions[id];
//         return;
//     }
    
//     // Jika menebak huruf
//     if (guess.length === 1 && guess.match(/[a-z]/i)) {
//         session.attempts++;
        
//         // Cek apakah huruf sudah pernah ditebak
//         if (session.guessedLetters.includes(guess)) {
//             await sock.sendMessage(id, { 
//                 text: `🎮 *Game Tebak Kata*\n\n` +
//                       `⚠️ Huruf *${guess}* sudah pernah ditebak sebelumnya!\n\n` +
//                       `Tebak kata: ${session.maskedWord}\n\n` +
//                       `*Petunjuk:* ${session.hint}\n\n` +
//                       `Huruf yang sudah ditebak: ${session.guessedLetters.join(', ')}\n` +
//                       `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali`
//             });
//             return;
//         }
        
//         // Tambahkan ke daftar huruf yang ditebak
//         session.guessedLetters.push(guess);
        
//         // Cek apakah huruf ada di kata
//         if (session.word.toLowerCase().includes(guess)) {
//             // Update masked word
//             session.maskedWord = updateMaskedWord(session.word, session.guessedLetters);
            
//             // Cek apakah semua huruf sudah ditebak
//             if (!session.maskedWord.includes('_')) {
//                 // Hitung skor
//                 const timeBonus = Math.max(0, 50 - Math.floor((Date.now() - session.startTime) / 1000));
//                 const attemptsBonus = Math.max(0, 50 - (session.attempts * 5));
//                 const finalScore = Math.min(100, session.score + timeBonus + attemptsBonus);
                
//                 await sock.sendMessage(id, { 
//                     text: `🎮 *Game Tebak Kata*\n\n` +
//                           `🎉 SELAMAT! Kamu berhasil menebak kata *${session.word}* dengan benar!\n\n` +
//                           `✨ *Skor:* ${finalScore}\n` +
//                           `🕐 *Waktu:* ${Math.floor((Date.now() - session.startTime) / 1000)} detik\n` +
//                           `🔄 *Percobaan:* ${session.attempts} kali\n\n` +
//                           `Ketik *.tebakkata* untuk main lagi!`
//                 });
                
//                 // Hapus sesi
//                 delete sessions[id];
//                 return;
//             }
            
//             await sock.sendMessage(id, { 
//                 text: `🎮 *Game Tebak Kata*\n\n` +
//                       `✅ Benar! Huruf *${guess}* ada dalam kata.\n\n` +
//                       `Tebak kata: ${session.maskedWord}\n\n` +
//                       `*Petunjuk:* ${session.hint}\n\n` +
//                       `Huruf yang sudah ditebak: ${session.guessedLetters.join(', ')}\n` +
//                       `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali`
//             });
//         } else {
//             // Kurangi skor
//             session.score = Math.max(0, session.score - 5);
            
//             await sock.sendMessage(id, { 
//                 text: `🎮 *Game Tebak Kata*\n\n` +
//                       `❌ Maaf! Huruf *${guess}* tidak ada dalam kata.\n\n` +
//                       `Tebak kata: ${session.maskedWord}\n\n` +
//                       `*Petunjuk:* ${session.hint}\n\n` +
//                       `Huruf yang sudah ditebak: ${session.guessedLetters.join(', ')}\n` +
//                       `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali`
//             });
//         }
//     } else {
//         // Jika input bukan huruf tunggal atau kata yang benar
//         session.attempts++;
//         session.score = Math.max(0, session.score - 5);
        
//         await sock.sendMessage(id, { 
//             text: `🎮 *Game Tebak Kata*\n\n` +
//                   `❌ Tebakan *${guess}* salah!\n\n` +
//                   `Tebak kata: ${session.maskedWord}\n\n` +
//                   `*Petunjuk:* ${session.hint}\n\n` +
//                   `Huruf yang sudah ditebak: ${session.guessedLetters.join(', ')}\n` +
//                   `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali`
//         });
//     }
    
//     // Cek apakah kesempatan habis
//     if (session.attempts >= session.maxAttempts) {
//         await sock.sendMessage(id, { 
//             text: `🎮 *Game Tebak Kata*\n\n` +
//                   `😔 Maaf, kesempatan habis!\n` +
//                   `Jawaban yang benar adalah: *${session.word}*\n\n` +
//                   `Ketik *.tebakkata* untuk main lagi!`
//         });
        
//         // Hapus sesi
//         delete sessions[id];
//     }
// };

// export const help = {
//     name: "tebakkata",
//     description: "Game tebak kata dengan petunjuk",
//     usage: ".tebakkata",
//     example: ".tebakkata"
// }; 