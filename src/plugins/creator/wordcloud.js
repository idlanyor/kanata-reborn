import { createCanvas } from 'canvas';
import d3Cloud from 'd3-cloud';

export const handler = "wc";
export const description = "Word Cloud Generator";

async function generateWordCloud(text, width = 800, height = 600) {
    return new Promise((resolve, reject) => {
        try {
            // Split teks menjadi kata-kata
            const words = text
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 2);
            
            // Hitung frekuensi kata
            const wordFreq = {};
            words.forEach(word => {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
            
            // Konversi ke format yang diperlukan d3-cloud
            const wordArray = Object.keys(wordFreq).map(word => {
                return {
                    text: word,
                    size: 10 + (wordFreq[word] * 10) // Ukuran berdasarkan frekuensi
                };
            });
            
            // Buat canvas untuk word cloud
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, width, height);
            
            // Buat layout word cloud
            d3Cloud()
                .size([width, height])
                .words(wordArray)
                .padding(5)
                .rotate(() => ~~(Math.random() * 2) * 90)
                .font('Impact')
                .fontSize(d => d.size)
                .on('end', words => {
                    ctx.translate(width / 2, height / 2);
                    
                    words.forEach(word => {
                        const fontSize = word.size;
                        ctx.font = `${fontSize}px Impact`;
                        
                        // Warna random
                        const hue = Math.random() * 360;
                        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                        
                        ctx.save();
                        ctx.translate(word.x, word.y);
                        ctx.rotate(word.rotate * Math.PI / 180);
                        ctx.textAlign = 'center';
                        ctx.fillText(word.text, 0, 0);
                        ctx.restore();
                    });
                    
                    resolve(canvas.toBuffer());
                })
                .start();
        } catch (error) {
            reject(error);
        }
    });
}

export default async ({ sock, m, id, psn }) => {
    if (!psn && !m.quoted) {
        await m.reply('🔠 *Word Cloud Generator*\n\nKirim teks panjang atau reply ke pesan untuk membuat word cloud!');
        return;
    }
    
    try {
        // Ambil teks dari pesan atau quote
        let text = psn;
        if (m.quoted && !text) {
            text = m.quoted.body || '';
        }
        
        if (!text || text.length < 50) {
            await m.reply('❌ Teks terlalu pendek! Minimal 50 karakter untuk hasil yang baik.');
            return;
        }
        
        await m.react('⏳');
        
        const wordcloudBuffer = await generateWordCloud(text);
        
        await sock.sendMessage(id, { 
            image: wordcloudBuffer,
            caption: '✨ *Word Cloud Generator*\n\nDibuat dari teks dengan panjang ' + text.length + ' karakter.'
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error generating word cloud:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat word cloud');
        await m.react('❌');
    }
};

export const help = {
    name: "wc",
    description: "Buat word cloud dari teks panjang",
    usage: ".wc <teks panjang> atau reply ke pesan",
    example: ".wc Lorem ipsum dolor sit amet..."
}; 