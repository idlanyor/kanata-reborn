import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = "idcard";
export const description = "ID Card Generator";

async function createIDCard(name, role, id, avatarUrl) {
    // Ukuran standar ID Card
    const canvas = createCanvas(1000, 1600);
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border putih
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = '60px Poppins Bold';
    ctx.textAlign = 'center';
    ctx.fillText('KANATA BOT', canvas.width/2, 150);
    
    ctx.font = '36px Poppins';
    ctx.fillText('OFFICIAL ID CARD', canvas.width/2, 210);
    
    // Foto profil (avatar)
    const avatarSize = 400;
    try {
        // Load avatar dari URL atau gunakan default
        const avatar = await loadImage(avatarUrl || 'https://i.ibb.co/G9qRvXH/default-avatar.png');
        
        // Buat avatar circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width/2, 450, avatarSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Gambar avatar
        ctx.drawImage(avatar, canvas.width/2 - avatarSize/2, 250, avatarSize, avatarSize);
        ctx.restore();
        
        // Tambah border avatar
        ctx.beginPath();
        ctx.arc(canvas.width/2, 450, avatarSize/2 + 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
    } catch (error) {
        console.error('Error loading avatar:', error);
        // Fallback untuk avatar
        ctx.beginPath();
        ctx.arc(canvas.width/2, 450, avatarSize/2, 0, Math.PI * 2);
        ctx.fillStyle = '#f1f1f1';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Placeholder text
        ctx.font = '100px Poppins Bold';
        ctx.fillStyle = '#3498db';
        ctx.fillText(name.charAt(0).toUpperCase(), canvas.width/2, 480);
    }
    
    // Informasi ID Card
    ctx.fillStyle = '#ffffff';
    
    // Nama
    ctx.font = '60px Poppins Bold';
    ctx.fillText(name, canvas.width/2, 700);
    
    // Divider
    ctx.fillRect(canvas.width/2 - 150, 740, 300, 5);
    
    // Role/Jabatan
    ctx.font = '40px Poppins';
    ctx.fillText(role, canvas.width/2, 800);
    
    // ID Number
    ctx.font = '36px Poppins';
    ctx.fillText(`ID: ${id}`, canvas.width/2, 880);
    
    // QR Code
    const qrCodeUrl = `https://wa.me/${id.replace(/[^0-9]/g, '')}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, {
        width: 250,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });
    
    const qrImage = await loadImage(qrCodeImage);
    ctx.drawImage(qrImage, canvas.width/2 - 125, 950, 250, 250);
    
    // Footer
    ctx.font = '30px Poppins';
    ctx.fillText('Scan untuk menghubungi', canvas.width/2, 1250);
    
    // Validity
    ctx.font = '28px Poppins Bold';
    ctx.fillText('VALID THRU: SELAMANYA', canvas.width/2, 1350);
    
    // Disclaimer
    ctx.font = '24px Poppins';
    ctx.fillText('Powered by Kanata Bot', canvas.width/2, 1450);
    
    return canvas.toBuffer('image/png');
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('Format: .idcard nama | jabatan | id');
        return;
    }
    
    try {
        const [name, role = 'Member', userId = id.split('@')[0]] = psn.split('|').map(item => item.trim());
        
        if (!name) {
            await m.reply('❌ Nama harus diisi!\nContoh: .idcard John Doe | Admin | 628123456789');
            return;
        }
        
        await m.react('⏳');
        
        // Coba dapatkan avatar dari profile picture
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(m.sender, 'image');
        } catch (error) {
            console.log('Failed to get avatar:', error);
            avatarUrl = 'https://i.ibb.co/G9qRvXH/default-avatar.png'; // Default avatar
        }
        
        const idCardBuffer = await createIDCard(name, role, userId, avatarUrl);
        
        await sock.sendMessage(id, {
            image: idCardBuffer,
            caption: '✨ ID Card Generator\n\n' +
                    `👤 *Nama:* ${name}\n` +
                    `💼 *Jabatan:* ${role}\n` +
                    `🆔 *ID:* ${userId}\n` +
                    `\nScan QR Code untuk menghubungi.`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat ID Card');
        await m.react('❌');
    }
};

export const help = {
    name: "idcard",
    description: "Buat ID Card keren dengan foto profil",
    usage: ".idcard <nama> | [jabatan] | [id]",
    example: ".idcard John Doe | Admin"
}; 