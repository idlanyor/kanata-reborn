import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Daftarkan font Delius Regular
registerFont(path.join(process.cwd(), 'src/assets/fonts/Delius-Regular.ttf'), { family: 'Delius' });

export async function menuCard(username, handle, today, avatarUrl) {
    // Buat canvas dengan ukuran card
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    
    try {
        // Background gradient sesuai permintaan
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // 0deg = vertical gradient
        gradient.addColorStop(0, 'rgba(255,0,0,1)');      // Merah
        gradient.addColorStop(0.53, 'rgb(245, 2, 152)'); // Oranye kecoklatan
        gradient.addColorStop(1, 'rgb(26, 0, 119)');    // Kuning kehijauan
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tambahkan overlay semi transparan dengan padding
        const padding = 20;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
        
        // Load avatar
        const avatar = await loadImage(avatarUrl);
        
        // Gambar avatar circle dengan border di tengah
        ctx.save();
        ctx.beginPath();
        const avatarSize = 150;
        // Posisikan avatar di tengah
        const avatarX = (canvas.width - avatarSize) / 2;
        const avatarY = 70;
        
        // Border avatar - warna lebih gelap untuk kontras dengan background baru
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#333333';
        ctx.fill();
        
        // Avatar
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        // Judul Menu - warna lebih terang untuk kontras dengan overlay
        ctx.font = 'bold 48px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('KANATA BOT MENU', canvas.width / 2, 60);
        
        // Username dengan font yang lebih menarik - warna lebih terang
        ctx.font = 'bold 36px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(username, canvas.width / 2, avatarY + avatarSize + 50);
        
        // Handle dengan warna yang lebih terang untuk kontras
        ctx.font = '24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('@' + handle.split('@')[0], canvas.width / 2, avatarY + avatarSize + 85);
        
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
        
        ctx.fillText(`Date: ${formattedDate}`, canvas.width / 2, avatarY + avatarSize + 120);
        
        // Informasi bot di sisi kanan - warna lebih terang
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('BOT INFO', canvas.width - 50, 100);
        
        ctx.font = '20px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Version: 3.0', canvas.width - 50, 135);
        ctx.fillText('Library: @seaavey/baileys', canvas.width - 50, 165);
        ctx.fillText('Type: ES6 Module', canvas.width - 50, 195);
        
        // Tambahkan informasi di sisi kiri
        ctx.textAlign = 'left';
        ctx.font = 'bold 24px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('FITUR POPULER', 50, 100);
        
        ctx.font = '20px Delius';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('• AI Chat & Image', 50, 135);
        ctx.fillText('• Sticker Maker', 50, 165);
        ctx.fillText('• Downloader', 50, 195);
        ctx.fillText('• Group Manager', 50, 225);
        ctx.fillText('• Game & Fun', 50, 255);
        
        // Tambahkan dekorasi di sisi kiri bawah
        ctx.font = 'bold 18px Delius';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Ketik .help untuk bantuan', 50, canvas.height - 70);
        ctx.fillText('Ketik .menu untuk daftar fitur', 50, canvas.height - 40);
        
        // Footer - warna lebih terang
        ctx.textAlign = 'center';
        ctx.font = 'italic 18px Delius';
        ctx.fillStyle = '#E0E0E0';
        ctx.fillText('© 2024 Kanata Bot • Created with ❤️ by Roy', canvas.width / 2, canvas.height - 40);

        return canvas.toBuffer();
        
    } catch (error) {
        console.error('Error membuat menu card:', error);
        throw error;
    }
}