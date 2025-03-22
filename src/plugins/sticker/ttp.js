import { createSticker, StickerTypes } from "wa-sticker-formatter";
import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = 'ttp'

export default async ({ sock, m, id, psn }) => {
    if (!psn) return m.reply('Teksnya mana kak?')
    
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    
    try {
        // Daftarkan font display yang jenaka
        const fontsPath = path.join(__dirname, '../../assets/fonts');
        registerFont(path.join(fontsPath, 'Poppins-Bold.ttf'), { family: 'DisplayFont' });
        
        // Buat canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        // Set background transparan (tidak perlu mengisi background)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Konfigurasi teks
        ctx.font = '70px DisplayFont';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Tambahkan outline pada teks agar lebih terlihat pada background transparan
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        
        // Wrap teks jika terlalu panjang
        const words = psn.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + word + ' ';
            if (ctx.measureText(testLine).width > canvas.width - 40) {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        // Tulis teks ke canvas
        const lineHeight = 80;
        const startY = (canvas.height - (lines.length * lineHeight)) / 2;
        
        lines.forEach((line, i) => {
            const x = canvas.width / 2;
            const y = startY + (i * lineHeight);
            
            // Tambahkan outline
            ctx.strokeText(line.trim(), x, y);
            // Tambahkan teks
            ctx.fillText(line.trim(), x, y);
        });
        
        // Convert canvas ke buffer
        const buffer = canvas.toBuffer('image/png');
        
        // Buat sticker
        const stickerOption = {
            pack: "KanataBot",
            author: "Roy",
            type: StickerTypes.FULL,
            quality: 100,
        }
        
        const generateSticker = await createSticker(buffer, stickerOption);
        await sock.sendMessage(id, { sticker: generateSticker })
        sock.sendMessage(id, { react: { text: '✅', key: m.key } })
        
    } catch (error) {
        console.log('Error creating sticker:', error);
        await sock.sendMessage(id, { text: `Error membuat stiker\nAlasan:\n${error}` })
    }
};

export const help = {
    name: 'ttp',
    description: 'Membuat stiker dari teks (Text To Picture)',
    usage: '.ttp <teks>'
}; 