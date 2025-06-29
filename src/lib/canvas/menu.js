import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Daftarkan font Delius Regular
registerFont(path.join(process.cwd(), 'src/assets/fonts/Delius-Regular.ttf'), { family: 'Delius' });
registerFont(path.join(process.cwd(), 'src/assets/fonts/Chewy-Regular.ttf'), { family: 'Chewy' });

export async function menuCard(username, handle, avatarUrl) {
    // Buat canvas dengan ukuran card
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    try {
        // Radius untuk sudut-sudut kartu
        const cornerRadius = 25;
        
        // Background gradient sesuai permintaan
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(canvas.width - cornerRadius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
        ctx.lineTo(canvas.width, canvas.height - cornerRadius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
        ctx.lineTo(cornerRadius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // 0deg = vertical gradient
        gradient.addColorStop(0, 'rgb(208, 255, 0)');      // Merah
        gradient.addColorStop(0.53, 'rgb(245, 160, 2)'); // Oranye kecoklatan
        gradient.addColorStop(1, 'rgb(233, 3, 3)');    // Kuning kehijauan
        ctx.fillStyle = gradient;
        ctx.fill();

        // Tambahkan efek 3D dengan multiple shadow layers
        const shadowPadding = 20;
        
        // Fungsi untuk menggambar rounded rectangle
        function roundRect(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
        
        // Layer 1 - shadow terluar (efek 3D)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(shadowPadding + 15, shadowPadding + 15, canvas.width - (shadowPadding * 2 + 15), canvas.height - (shadowPadding * 2 + 15), cornerRadius - 5);
        
        // Layer 2 - shadow tengah
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        roundRect(shadowPadding + 10, shadowPadding + 10, canvas.width - (shadowPadding * 2 + 10), canvas.height - (shadowPadding * 2 + 10), cornerRadius - 5);
        
        // Layer 3 - shadow dalam
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        roundRect(shadowPadding + 5, shadowPadding + 5, canvas.width - (shadowPadding * 2 + 5), canvas.height - (shadowPadding * 2 + 5), cornerRadius - 5);
        
        // Layer utama dengan bevel effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        roundRect(shadowPadding, shadowPadding, canvas.width - (shadowPadding * 2), canvas.height - (shadowPadding * 2), cornerRadius - 5);
        
        // Tambahkan highlight di bagian atas untuk efek 3D
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(shadowPadding + cornerRadius - 5, shadowPadding);
        ctx.lineTo(canvas.width - shadowPadding - cornerRadius + 5, shadowPadding);
        ctx.quadraticCurveTo(canvas.width - shadowPadding, shadowPadding, canvas.width - shadowPadding, shadowPadding + cornerRadius - 5);
        ctx.lineTo(canvas.width - shadowPadding, shadowPadding + 50);
        ctx.lineTo(shadowPadding, shadowPadding + 50);
        ctx.lineTo(shadowPadding, shadowPadding + cornerRadius - 5);
        ctx.quadraticCurveTo(shadowPadding, shadowPadding, shadowPadding + cornerRadius - 5, shadowPadding);
        ctx.closePath();
        
        const highlightGradient = ctx.createLinearGradient(0, shadowPadding, 0, shadowPadding + 50);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fill();
        ctx.restore();

        // Load avatar
        const avatar = await loadImage(avatarUrl);

        // Gambar avatar circle dengan border dan efek 3D
        ctx.save();
        // Shadow untuk avatar (efek 3D)
        ctx.shadowColor = 'rgba(255, 255, 255, 0.46)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        const avatarSize = 200;
        // Posisikan avatar di tengah
        const avatarX = (canvas.width - avatarSize) / 2;
        const avatarY = 80;

        // Border avatar dengan efek 3D
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
        const borderGradient = ctx.createRadialGradient(
            avatarX + avatarSize / 2 - 10, 
            avatarY + avatarSize / 2 - 10, 
            5,
            avatarX + avatarSize / 2, 
            avatarY + avatarSize / 2, 
            avatarSize / 2 + 5
        );
        borderGradient.addColorStop(0, '#555555');
        borderGradient.addColorStop(1, '#111111');
        ctx.fillStyle = borderGradient;
        ctx.fill();
        
        // Reset shadow untuk avatar
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Avatar dengan clip
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Username dengan efek 3D
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.font = 'bold 40px Chewy';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(username, canvas.width / 2, avatarY + avatarSize + 60);
        ctx.restore();

        // Handle dengan efek 3D
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.font = '24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(handle.replace('628', '08'), canvas.width / 2, avatarY + avatarSize + 105);
        ctx.restore();

        // Tanggal dengan format yang lebih baik
        ctx.font = '20px Delius';
        ctx.fillStyle = '#E0E0E0';
        ctx.textAlign = 'center';
        // Konversi format tanggal ke format Indonesia
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        const dateObj = new Date();
        const dayName = days[dateObj.getDay()];
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        const formattedDate = `${dayName}, ${day} ${month} ${year}`;

        ctx.fillText(`${formattedDate}`, canvas.width / 2, avatarY + avatarSize + 145);

        // Informasi bot di sisi kanan dengan efek 3D
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('BOT INFO', canvas.width - 50, 120);
        ctx.restore();

        ctx.textAlign = 'right';
        ctx.font = '20px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Bot Name: Kanata V3', canvas.width - 50, 145);
        ctx.fillText('Version: 3.0', canvas.width - 50, 175);
        ctx.fillText('Creator: Roy', canvas.width - 50, 205);
        ctx.fillText('Type: ES6 Module', canvas.width - 50, 235);
        ctx.fillText('Library: @fizzxydev/baileys-pro', canvas.width - 50, 265);

        // Tambahkan informasi di sisi kiri dengan efek 3D
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'left';
        ctx.font = 'bold 24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('FITUR POPULER', 50, 120);
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.font = '20px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('• AI Chat & Image', 50, 145);
        ctx.fillText('• Sticker Maker', 50, 175);
        ctx.fillText('• Downloader', 50, 205);
        ctx.fillText('• Productivity Tools', 50, 235);
        ctx.fillText('• Game & Fun', 50, 265);

        // Footer dengan efek 3D
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.textAlign = 'center';
        ctx.font = 'italic 18px Delius';
        ctx.fillStyle = '#E0E0E0';
        ctx.fillText('© 2024 Kanata Bot • Created with ❤️ by Roy', canvas.width / 2, canvas.height - 40);
        ctx.restore();

        return canvas.toBuffer();

    } catch (error) {
        console.error('Error membuat menu card:', error);
        throw error;
    }
}