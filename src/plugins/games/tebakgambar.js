import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = "tebakgambar";
export const description = "Game Tebak Gambar";

// Simpan sesi permainan
const sessions = {};

// Data gambar dengan jawaban (idealnya dalam file JSON terpisah)
const imagesFilePath = path.join(__dirname, '../../assets/tebakgambar.json');
let imageList = [
    {
        image: 'https://i.ibb.co/Hp4nHsX/tebak1.png',
        answer: 'belanja online',
        hint: 'Aktivitas membeli barang melalui internet'
    },
    {
        image: 'https://i.ibb.co/ZM2rJPd/tebak2.png',
        answer: 'mata kaki',
        hint: 'Bagian tubuh di pertemuan kaki dan tungkai'
    },
    {
        image: 'https://i.ibb.co/G3jVMkv/tebak3.png',
        answer: 'jari manis',
        hint: 'Jari di sebelah jari kelingking'
    },
    // Tambahkan lebih banyak gambar sesuai kebutuhan
];

// Load gambar dari file jika ada
try {
    if (fs.existsSync(imagesFilePath)) {
        const imagesData = fs.readFileSync(imagesFilePath, 'utf8');
        imageList = JSON.parse(imagesData);
    }
} catch (error) {
    console.error('Error loading images file:', error);
}

// Helper function untuk mengacak array
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Fungsi untuk memulai sesi baru
function createSession(id) {
    const shuffledImages = shuffle(imageList);
    const imageData = shuffledImages[0];
    
    return {
        imageUrl: imageData.image,
        answer: imageData.answer.toLowerCase(),
        hint: imageData.hint,
        attempts: 0,
        maxAttempts: 5,
        hintGiven: false,
        startTime: Date.now(),
        score: 100
    };
}

// Fungsi untuk membuat gambar petunjuk
async function createHintImage(url, answer) {
    try {
        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');
        
        // Gambar background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load dan gambar image
        const image = await loadImage(url);
        
        // Hitung aspek rasio untuk fit image ke canvas
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        const x = (canvas.width - image.width * scale) / 2;
        const y = (canvas.height - image.height * scale) / 2;
        
        ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
        
        // Tambah overlay hint
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
        
        // Tambah teks petunjuk jumlah huruf
        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Tampilkan jumlah kata dan huruf
        const words = answer.split(' ');
        let hintText = '';
        
        words.forEach((word, i) => {
            hintText += '🔤 ' + '_'.repeat(word.length);
            if (i < words.length - 1) hintText += '  ';
        });
        
        ctx.fillText(hintText, canvas.width / 2, canvas.height - 60);
        
        return canvas.toBuffer();
    } catch (error) {
        console.error('Error creating hint image:', error);
        return null;
    }
}

export default async ({ sock, m, id, psn }) => {
    // Jika ada perintah 'hint', berikan petunjuk
    if (psn && psn.toLowerCase() === 'hint') {
        if (sessions[id] && !sessions[id].hintGiven) {
            sessions[id].hintGiven = true;
            sessions[id].score = Math.max(0, sessions[id].score - 20); // Kurangi skor karena minta hint
            
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `🔍 *Petunjuk:* ${sessions[id].hint}\n\n` +
                      `⚠️ Skor dikurangi 20 poin karena meminta petunjuk!`
            });
        } else if (sessions[id] && sessions[id].hintGiven) {
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `⚠️ Kamu sudah menggunakan petunjuk!\n\n` +
                      `🔍 *Petunjuk:* ${sessions[id].hint}`
            });
        } else {
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `❌ Tidak ada permainan yang sedang berlangsung.`
            });
        }
        return;
    }
    
    // Jika ada perintah 'stop', hentikan permainan
    if (psn && psn.toLowerCase() === 'stop') {
        if (sessions[id]) {
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `Permainan dihentikan!\n` +
                      `Jawaban yang benar adalah: *${sessions[id].answer}*`
            });
            delete sessions[id];
        } else {
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `❌ Tidak ada permainan yang sedang berlangsung.`
            });
        }
        return;
    }
    
    // Cek apakah ada sesi yang sedang berlangsung
    if (!sessions[id]) {
        // Tidak ada sesi, mulai permainan baru
        sessions[id] = createSession(id);
        
        // Buat dan kirim gambar dengan hint
        const hintImageBuffer = await createHintImage(sessions[id].imageUrl, sessions[id].answer);
        
        if (hintImageBuffer) {
            await sock.sendMessage(id, { 
                image: hintImageBuffer,
                caption: `🎮 *Game Tebak Gambar*\n\n` +
                         `Tebak gambar di atas!\n\n` +
                         `Ketik jawabanmu langsung.\n` +
                         `Kesempatan: ${sessions[id].maxAttempts} kali\n\n` +
                         `Ketik *hint* untuk petunjuk.\n` +
                         `Ketik *stop* untuk menyerah.`
            });
        } else {
            // Fallback jika gagal membuat gambar
            await sock.sendMessage(id, { 
                image: { url: sessions[id].imageUrl },
                caption: `🎮 *Game Tebak Gambar*\n\n` +
                         `Tebak gambar di atas!\n\n` +
                         `Ketik jawabanmu langsung.\n` +
                         `Kesempatan: ${sessions[id].maxAttempts} kali\n\n` +
                         `Ketik *hint* untuk petunjuk.\n` +
                         `Ketik *stop* untuk menyerah.`
            });
        }
        return;
    }
    
    // Ada sesi yang sedang berlangsung
    const session = sessions[id];
    
    // Jika tidak ada input
    if (!psn) {
        const hintImageBuffer = await createHintImage(session.imageUrl, session.answer);
        
        if (hintImageBuffer) {
            await sock.sendMessage(id, { 
                image: hintImageBuffer,
                caption: `🎮 *Game Tebak Gambar*\n\n` +
                         `Masih menebak gambar...\n` +
                         `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali\n\n` +
                         `Ketik *hint* untuk petunjuk.\n` +
                         `Ketik *stop* untuk menyerah.`
            });
        } else {
            await sock.sendMessage(id, { 
                image: { url: session.imageUrl },
                caption: `🎮 *Game Tebak Gambar*\n\n` +
                         `Masih menebak gambar...\n` +
                         `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali\n\n` +
                         `Ketik *hint* untuk petunjuk.\n` +
                         `Ketik *stop* untuk menyerah.`
            });
        }
        return;
    }
    
    // Proses tebakan
    const guess = psn.toLowerCase().trim();
    session.attempts++;
    
    // Cek apakah jawaban benar
    if (guess === session.answer) {
        // Hitung skor
        const timeBonus = Math.max(0, 30 - Math.floor((Date.now() - session.startTime) / 1000));
        const attemptsBonus = Math.max(0, 30 - (session.attempts * 5));
        const finalScore = Math.min(100, session.score + timeBonus + attemptsBonus);
        
        await sock.sendMessage(id, { 
            text: `🎮 *Game Tebak Gambar*\n\n` +
                  `🎉 SELAMAT! Jawabanmu *${session.answer}* benar!\n\n` +
                  `✨ *Skor:* ${finalScore}\n` +
                  `🕐 *Waktu:* ${Math.floor((Date.now() - session.startTime) / 1000)} detik\n` +
                  `🔄 *Percobaan:* ${session.attempts} kali\n\n` +
                  `Ketik *.tebakgambar* untuk main lagi!`
        });
        
        // Hapus sesi
        delete sessions[id];
        return;
    } else {
        // Jawaban salah
        session.score = Math.max(0, session.score - 10);
        
        // Cek apakah masih ada kesempatan
        if (session.attempts >= session.maxAttempts) {
            await sock.sendMessage(id, { 
                text: `🎮 *Game Tebak Gambar*\n\n` +
                      `😔 Maaf, kesempatan habis!\n` +
                      `Jawaban yang benar adalah: *${session.answer}*\n\n` +
                      `Ketik *.tebakgambar* untuk main lagi!`
            });
            
            // Hapus sesi
            delete sessions[id];
            return;
        }
        
        await sock.sendMessage(id, { 
            text: `🎮 *Game Tebak Gambar*\n\n` +
                  `❌ Jawaban *${guess}* salah!\n` +
                  `Kesempatan tersisa: ${session.maxAttempts - session.attempts} kali\n\n` +
                  `${!session.hintGiven ? 'Ketik *hint* untuk petunjuk.' : ''}`
        });
    }
};

export const help = {
    name: "tebakgambar",
    description: "Game tebak gambar dengan petunjuk",
    usage: ".tebakgambar",
    example: ".tebakgambar"
}; 