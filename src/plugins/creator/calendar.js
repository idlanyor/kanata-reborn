import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = "kalender";
export const description = "Kalender Motivasi Generator";

// Daftar quotes motivasi
const motivationalQuotes = [
    "Proses tidak akan mengkhianati hasil.",
    "Jangan bandingkan prosesmu dengan orang lain.",
    "Kegagalan adalah kesuksesan yang tertunda.",
    "Masa depan adalah milik mereka yang percaya pada keindahan mimpi mereka.",
    "Jika kamu ingin pelangi, kamu harus siap dengan hujannya.",
    "Keberhasilan adalah kemampuan untuk bergerak dari kegagalan ke kegagalan tanpa kehilangan semangat.",
    "Jangan takut untuk bermimpi besar. Tidak ada yang salah dengan itu.",
    "Keajaiban selalu terjadi pada mereka yang tidak pernah menyerah.",
    "Hidup adalah tentang menciptakan dirimu sendiri.",
    "Sukses adalah saat persiapan bertemu dengan kesempatan."
];

async function createCalendar(quote, backgroundUrl) {
    // Ukuran kalender
    const canvas = createCanvas(1200, 1600);
    const ctx = canvas.getContext('2d');
    
    // Background berwarna atau gambar
    if (backgroundUrl) {
        try {
            const background = await loadImage(backgroundUrl);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            
            // Overlay transparan untuk readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.error('Failed to load background:', error);
            // Fallback background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#8e44ad');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#8e44ad');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set tanggal dan waktu
    moment.locale('id');
    const now = moment();
    
    // Header dengan bulan dan tahun
    ctx.font = '80px Poppins Bold';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(now.format('MMMM YYYY').toUpperCase(), canvas.width/2, 150);
    
    // Tanggal dengan ukuran besar
    ctx.font = '300px Poppins Bold';
    ctx.fillText(now.format('DD'), canvas.width/2, 500);
    
    // Hari
    ctx.font = '60px Poppins';
    ctx.fillText(now.format('dddd'), canvas.width/2, 600);
    
    // Border untuk quote
    const quoteBoxMargin = 100;
    const quoteBoxWidth = canvas.width - (quoteBoxMargin * 2);
    const quoteBoxHeight = 400;
    const quoteBoxY = 800;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(quoteBoxMargin, quoteBoxY, quoteBoxWidth, quoteBoxHeight);
    
    // Quote
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Poppins';
    
    // Word wrap untuk quote
    const maxWidth = quoteBoxWidth - 80;
    const words = quote.split(' ');
    let line = '';
    const lines = [];
    let y = quoteBoxY + 100;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    
    // Render lines
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width/2, y);
        y += 60;
    }
    
    // Footer
    ctx.font = '30px Poppins';
    ctx.fillText('Powered by Kanata Bot', canvas.width/2, 1500);
    
    return canvas.toBuffer('image/png');
}

export default async ({ sock, m, id, psn }) => {
    try {
        // Gunakan quote dari user atau ambil random
        const quote = psn ? psn.trim() : motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        
        await m.react('⏳');
        
        // Coba gunakan background dari attachment jika ada
        let backgroundUrl;
        if (m.quoted && m.quoted.type === 'image') {
            try {
                const buffer = await m.quoted.download();
                // Upload gambar jika perlu (menggunakan helper uploader)
                // backgroundUrl = await uploadImage(buffer);
                
                // Untuk contoh kita pakai buffer
                backgroundUrl = buffer;
            } catch (error) {
                console.error('Failed to process image:', error);
            }
        }
        
        const calendarBuffer = await createCalendar(quote, backgroundUrl);
        
        await sock.sendMessage(id, {
            image: calendarBuffer,
            caption: '✨ Kalender Motivasi\n\n' +
                    `📅 *Tanggal:* ${moment().format('DD MMMM YYYY')}\n` +
                    `📝 *Quote:* "${quote}"\n\n` +
                    `_Gunakan .kalender [quote] untuk custom quote_\n` +
                    `_Reply gambar untuk custom background_`
        }, { quoted: m });
        
        await m.react('🗓️');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat kalender');
        await m.react('❌');
    }
};

export const help = {
    name: "kalender",
    description: "Buat kalender motivasi dengan tanggal hari ini",
    usage: ".kalender [quote motivasi]",
    example: ".kalender Jangan menyerah sebelum mencoba"
}; 