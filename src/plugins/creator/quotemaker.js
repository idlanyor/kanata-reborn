import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Daftarkan font Poppins
const fontsPath = path.join(__dirname, '../../assets/fonts');
registerFont(path.join(fontsPath, 'Poppins-Regular.ttf'), { family: 'Poppins' });
registerFont(path.join(fontsPath, 'Poppins-Bold.ttf'), { family: 'Poppins-Bold' });
registerFont(path.join(fontsPath, 'Poppins-Italic.ttf'), { family: 'Poppins-Italic' });

export const handler = "quote";
export const description = "✨ Buat quote keren dengan background dan font menarik!";

export default async ({ sock, m, id, psn, sender, noTel }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: "✍️ Format: *.quote teks | author*\n\nContoh: *.quote Hidup itu seperti kopi, kadang pahit kadang manis | Kanata*"
        });
        return;
    }

    const [quote, author = "Anonymous"] = psn.split("|").map(item => item.trim());
    
    try {
        // Buat canvas
        const canvas = createCanvas(800, 418);
        const ctx = canvas.getContext('2d');

        // Load background random dari folder assets
        const bgFolder = path.join(__dirname, '../../assets/backgrounds');
        const backgrounds = fs.readdirSync(bgFolder).filter(file => file.endsWith('.png'));
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        const background = await loadImage(path.join(bgFolder, randomBg));

        // Gambar background
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Tambah overlay gelap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Sedikit lebih gelap untuk keterbacaan
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Setup font dan style
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Gambar quote dengan Poppins Bold
        ctx.font = '40px "Poppins-Bold"';
        wrapText(ctx, `"${quote}"`, canvas.width/2, canvas.height/2 - 20, canvas.width - 120, 55);

        // Gambar author dengan Poppins Italic
        ctx.font = '28px "Poppins-Italic"';
        ctx.fillText(`- ${author} -`, canvas.width/2, canvas.height - 60);

        // Convert ke buffer dengan kualitas tinggi
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

        // Kirim hasilnya
        await sock.sendMessage(id, {
            image: buffer,
            caption: '✨ Quote maker by Kanata Bot'
        }, { quoted:m });

    } catch (error) {
        console.error("Error in quote maker:", error);
        await sock.sendMessage(id, { 
            text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏" 
        });
    }
};

// Fungsi untuk wrap text yang dioptimasi untuk Poppins
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let totalHeight = 0;

    // Hitung total tinggi teks terlebih dahulu
    let tempY = y;
    let tempLine = '';
    for(let n = 0; n < words.length; n++) {
        const testLine = tempLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            totalHeight += lineHeight;
            tempLine = words[n] + ' ';
        } else {
            tempLine = testLine;
        }
    }
    totalHeight += lineHeight;

    // Mulai dari posisi yang tepat agar teks berada di tengah vertikal
    y = y - (totalHeight / 2);

    // Gambar teks
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
} 