import { createSticker, StickerTypes } from "wa-sticker-formatter";
import { createCanvas } from 'canvas';

export const handler = 'ttp'

export default async ({ sock, m, id, psn }) => {
    if (!psn) return m.reply('Teksnya mana kak?')
    
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    
    try {
        // Buat canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        // Set background putih
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Konfigurasi teks
        ctx.font = '70px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
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
            ctx.fillText(line.trim(), canvas.width / 2, startY + (i * lineHeight));
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