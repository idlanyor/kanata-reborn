import { createSticker, StickerTypes } from "wa-sticker-formatter";
import { createCanvas } from 'canvas';
import GIFEncoder from 'gifencoder';

export const handler = 'attp'

export default async ({ sock, m, id, psn }) => {
    if (!psn) return m.reply('Teksnya mana kak?')
    
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    
    try {
        // Inisialisasi GIF encoder
        const encoder = new GIFEncoder(512, 512);
        encoder.start();
        encoder.setRepeat(0);   // 0 untuk loop
        encoder.setDelay(50);   // 50ms delay antar frame
        encoder.setQuality(10); // Kualitas gambar
        
        // Buat canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        // Warna untuk animasi pelangi
        const colors = [
            '#ff0000', '#ffa500', '#ffff00', '#008000',
            '#0000ff', '#4b0082', '#ee82ee'
        ];
        
        // Buat frame untuk setiap warna
        for (let i = 0; i < colors.length; i++) {
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Konfigurasi teks
            ctx.font = '70px Arial';
            ctx.fillStyle = colors[i];
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Wrap teks
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
            
            // Tulis teks
            const lineHeight = 80;
            const startY = (canvas.height - (lines.length * lineHeight)) / 2;
            
            lines.forEach((line, index) => {
                ctx.fillText(line.trim(), canvas.width / 2, startY + (index * lineHeight));
            });
            
            // Tambahkan frame ke GIF
            encoder.addFrame(ctx);
        }
        
        encoder.finish();
        
        // Convert ke buffer
        const buffer = encoder.out.getData();
        
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
    name: 'attp',
    description: 'Membuat stiker bergerak dari teks (Animated Text To Picture)',
    usage: '.attp <teks>'
}; 