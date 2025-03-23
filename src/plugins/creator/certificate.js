import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import moment from 'moment';
import QRCode from 'qrcode';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register fonts Poppins untuk semua text
registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Medium.ttf'), { family: 'Poppins Medium' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Italic.ttf'), { family: 'Poppins Italic' });

export const handler = "cert";
export const description = "Certificate Generator Dicoding Style";

async function createCertificate(name, course, certID, date) {
    // Ukuran dan proporsi yang persis dengan template
    const canvas = createCanvas(1748, 1240);
    const ctx = canvas.getContext('2d');
    
    // Background & Frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border luar hitam
    ctx.strokeStyle = '#2D3E50';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Border dalam putih
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);
    
    // Background banner dengan bentuk flag
    ctx.fillStyle = '#2D3E50';
    const bannerWidth = 300;
    
    // Gambar bentuk banner menggunakan path
    ctx.beginPath();
    ctx.moveTo(canvas.width - bannerWidth, 40); // Titik kiri atas
    ctx.lineTo(canvas.width - 40, 40); // Titik kanan atas
    ctx.lineTo(canvas.width - 40, 200); // Titik kanan bawah
    ctx.lineTo(canvas.width - (bannerWidth/2), 260); // Titik tengah bawah (ujung)
    ctx.lineTo(canvas.width - bannerWidth, 200); // Titik kiri bawah
    ctx.closePath();
    ctx.fill();
    
    // Text "SERTIFIKAT KOMPETENSI" dalam banner
    ctx.font = '28px Poppins Bold';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT', canvas.width - (bannerWidth/2) - 20, 100);
    ctx.fillText('KOMPETENSI', canvas.width - (bannerWidth/2) - 20, 140);
    
    // Logo dicoding
    const logoPath = join(__dirname, '../../assets/images/dicoding-logo.png');
    if (fs.existsSync(logoPath)) {
        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, 100, 120, 180, 40);
    } else {
        // Fallback jika logo tidak ada
        ctx.textAlign = 'left';
        ctx.font = '40px Poppins Bold';
        ctx.fillStyle = '#2D3E50';
        ctx.fillText('dicoding', 100, 150);
    }
    
    // ID Sertifikat dalam box
    ctx.fillStyle = '#2D3E50';
    ctx.fillRect(100, 190, 160, 40);
    ctx.font = '18px Poppins';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(certID, 180, 217);
    
    // Badge nilai dengan ornament
    // Lingkaran luar untuk ornament
    ctx.beginPath();
    ctx.arc(canvas.width - (bannerWidth/2) - 20, 170, 70, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ornament garis-garis di sekitar angka
    for (let i = 0; i < 36; i++) {
        const angle = i * 10 * Math.PI / 180;
        const startRadius = 50;
        const endRadius = (i % 2 === 0) ? 60 : 55;
        
        const startX = canvas.width - (bannerWidth/2) - 20 + Math.cos(angle) * startRadius;
        const startY = 170 + Math.sin(angle) * startRadius;
        const endX = canvas.width - (bannerWidth/2) - 20 + Math.cos(angle) * endRadius;
        const endY = 170 + Math.sin(angle) * endRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Lingkaran nilai
    ctx.beginPath();
    ctx.arc(canvas.width - (bannerWidth/2) - 20, 170, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Nilai
    ctx.font = '60px Poppins Bold';
    ctx.fillStyle = '#2D3E50';
    ctx.textAlign = 'center';
    ctx.fillText('9', canvas.width - (bannerWidth/2) - 20, 190);
    
    // Teks utama
    ctx.textAlign = 'left';
    ctx.font = '24px Poppins';
    ctx.fillStyle = '#2D3E50';
    ctx.fillText('Diberikan kepada', 100, 300);
    
    // Nama peserta
    ctx.font = '42px Poppins Bold';
    ctx.fillStyle = '#00C3FF';
    ctx.fillText(name, 100, 350);
    
    // Teks kelas
    ctx.font = '24px Poppins';
    ctx.fillStyle = '#2D3E50';
    ctx.fillText('Atas kelulusannya pada kelas', 100, 400);
    
    // Nama kelas
    ctx.font = '30px Poppins Bold';
    ctx.fillStyle = '#00C3FF';
    ctx.fillText(course, 100, 450);
    
    // Tanggal
    ctx.font = '24px Poppins';
    ctx.fillStyle = '#2D3E50';
    ctx.fillText(date, 100, 550);
    
    // Tanda tangan (gambar atau font script/cursive)
    const signaturePath = join(__dirname, '../../assets/images/signature.png');
    if (fs.existsSync(signaturePath)) {
        const signature = await loadImage(signaturePath);
        ctx.drawImage(signature, 100, 580, 180, 80);
    } else {
        // Fallback jika gambar tanda tangan tidak ada
        ctx.font = 'italic 30px Poppins Italic';
        ctx.fillStyle = '#2D3E50';
        ctx.fillText('Narenda Wicaksono', 100, 620);
    }
    
    // Nama dan jabatan di bawah tanda tangan
    ctx.font = '22px Poppins';
    ctx.fillStyle = '#2D3E50';
    ctx.fillText('Narenda Wicaksono', 100, 680);
    ctx.font = '18px Poppins';
    ctx.fillText('Chief Executive Officer', 100, 710);
    
    // QR Code
    const qrCodeUrl = `dicoding.com/certificates/${certID}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, {
        width: 150,
        margin: 0,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });
    
    const qrImage = await loadImage(qrCodeImage);
    ctx.drawImage(qrImage, canvas.width - 200, canvas.height - 230, 150, 150);
    
    // Teks verifikasi sertifikat
    ctx.font = '16px Poppins';
    ctx.fillStyle = '#2D3E50';
    ctx.textAlign = 'right';
    ctx.fillText('Verifikasi Sertifikat', canvas.width - 200, canvas.height - 60);
    ctx.fillText(`dicoding.com/certificates/${certID}`, canvas.width - 200, canvas.height - 40);
    ctx.fillText(`Berlaku hingga 27 Mei 2024`, canvas.width - 200, canvas.height - 20);
    
    return canvas.toBuffer('image/png', { compressionLevel: 0 });
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('Format: .cert nama | nama kelas | ID sertifikat (opsional)');
        return;
    }
    
    try {
        const parts = psn.split('|').map(item => item.trim());
        const name = parts[0];
        const course = parts[1];
        // Generate random ID jika tidak disediakan
        const certID = parts[2] || 'MEP' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        if (!name || !course) {
            await m.reply('❌ Format tidak lengkap!\nContoh: .cert Raynaldi | Belajar Dasar Pemrograman Web');
            return;
        }
        
        await m.react('⏳');
        
        // Generate tanggal dalam format "27 Mei 2021"
        const date = moment().format('DD MMMM YYYY');
        
        const certBuffer = await createCertificate(name, course, certID, date);
        
        // Buat frame untuk sertifikat (opsional)
        const finalCanvas = createCanvas(1748 + 100, 1240 + 100);
        const finalCtx = finalCanvas.getContext('2d');
        
        // Background frame gelap
        finalCtx.fillStyle = '#2D3E50';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Letakkan sertifikat dengan margin
        const cert = await loadImage(certBuffer);
        finalCtx.drawImage(cert, 50, 50);
        
        const finalBuffer = finalCanvas.toBuffer('image/png');
        
        await sock.sendMessage(id, {
            image: finalBuffer,
            caption: '✨ Sertifikat Kompetensi Dicoding\n\n' +
                    `👤 *Nama:* ${name}\n` +
                    `📚 *Kelas:* ${course}\n` +
                    `🆔 *ID Sertifikat:* ${certID}\n` +
                    `📅 *Tanggal:* ${date}`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat sertifikat');
        await m.react('❌');
    }
};

export const help = {
    name: "cert",
    description: "Generate sertifikat kompetensi Dicoding style",
    usage: ".cert <nama> | <nama kelas> | [ID sertifikat]",
    example: ".cert Raynaldi | Belajar Dasar Pemrograman Web"
}; 