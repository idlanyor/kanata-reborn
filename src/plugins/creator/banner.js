import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });

export const handler = "banner";
export const description = "Social Media Banner Generator";

async function createBanner(text, style = 'gaming') {
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    
    // Style presets
    const styles = {
        gaming: {
            bgColor: ['#ff0844', '#ffb199'],
            textColor: '#ffffff',
            pattern: 'hexagon'
        },
        elegant: {
            bgColor: ['#000428', '#004e92'],
            textColor: '#ffffff',
            pattern: 'lines'
        },
        nature: {
            bgColor: ['#11998e', '#38ef7d'],
            textColor: '#ffffff',
            pattern: 'waves'
        }
    };
    
    const currentStyle = styles[style] || styles.gaming;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, currentStyle.bgColor[0]);
    gradient.addColorStop(1, currentStyle.bgColor[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pattern overlay
    if (currentStyle.pattern === 'hexagon') {
        // Draw hexagon pattern
        for (let i = 0; i < canvas.width; i += 100) {
            for (let j = 0; j < canvas.height; j += 100) {
                ctx.beginPath();
                ctx.strokeStyle = `${currentStyle.textColor}22`;
                ctx.lineWidth = 2;
                // Draw hexagon
                for (let k = 0; k < 6; k++) {
                    const angle = k * Math.PI / 3;
                    const x = i + 30 * Math.cos(angle);
                    const y = j + 30 * Math.sin(angle);
                    if (k === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
    
    // Text dengan efek
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Main text
    ctx.font = '80px Poppins Bold';
    ctx.fillStyle = currentStyle.textColor;
    
    // Word wrap
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > canvas.width - 100) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine);
    
    // Draw text lines
    lines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width/2, canvas.height/2 - (lines.length - 1) * 50/2 + i * 50);
    });
    
    return canvas.toBuffer();
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('Format: .banner teks | style\nStyle: gaming, elegant, nature');
        return;
    }
    
    try {
        const [text, style = 'gaming'] = psn.split('|').map(item => item.trim());
        
        if (!text) {
            await m.reply('❌ Masukkan teks untuk banner!\nContoh: .banner Welcome to My Channel | gaming');
            return;
        }
        
        await m.react('⏳');
        const bannerBuffer = await createBanner(text, style);
        
        await sock.sendMessage(id, {
            image: bannerBuffer,
            caption: '✨ Banner Generator\n\n' +
                    `📝 *Teks:* ${text}\n` +
                    `🎨 *Style:* ${style}`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat banner');
        await m.react('❌');
    }
}; 