import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = "card";
export const description = "Business Card Generator";

async function createBusinessCard(name, job, contact, color = '#1DA1F2') {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');
    
    // Background dengan gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desain geometris
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(300, 0);
    ctx.lineTo(500, 600);
    ctx.lineTo(0, 600);
    ctx.fillStyle = `${color}22`;
    ctx.fill();
    
    // Nama dengan efek shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.font = '60px Poppins Bold';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 50, 200);
    
    // Job title
    ctx.shadowBlur = 5;
    ctx.font = '30px Poppins';
    ctx.fillText(job, 50, 250);
    
    // Contact info dengan icon
    ctx.font = '25px Poppins';
    ctx.fillText(`📱 ${contact}`, 50, 350);
    
    // QR Code placeholder
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 200, 50, 150, 150);
    
    return canvas.toBuffer();
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('Format: .card nama | pekerjaan | kontak | warna(opsional)');
        return;
    }
    
    try {
        const [name, job, contact, color = '#1DA1F2'] = psn.split('|').map(item => item.trim());
        
        if (!name || !job || !contact) {
            await m.reply('❌ Format tidak lengkap!\nContoh: .card John Doe | Web Developer | +62123456789 | #ff0000');
            return;
        }
        
        await m.react('⏳');
        const cardBuffer = await createBusinessCard(name, job, contact, color);
        
        await sock.sendMessage(id, {
            image: cardBuffer,
            caption: '✨ Business Card Generator\n\n' +
                    `👤 *Nama:* ${name}\n` +
                    `💼 *Pekerjaan:* ${job}\n` +
                    `📱 *Kontak:* ${contact}`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat kartu nama');
        await m.react('❌');
    }
}; 