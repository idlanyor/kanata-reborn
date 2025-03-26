import { createCanvas } from 'canvas';

export const handler = "tc";
export const description = "Word Cloud Generator (Simple Version)";

async function generateWordCloud(text, width = 800, height = 600) {
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
    
    // Ambil 30 kata teratas berdasarkan frekuensi
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([word, freq]) => ({
            text: word,
            size: Math.min(70, 20 + (freq * 5)), // Batasi ukuran maksimum
            freq: freq // Simpan frekuensi untuk penempatan
        }));
    
    // Buat canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#1a2530');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Tambahkan sedikit texture/pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < width; i += 20) {
        for (let j = 0; j < height; j += 20) {
            ctx.fillRect(i, j, 10, 10);
        }
    }
    
    // Struktur data untuk melacak area yang sudah terisi
    const occupiedAreas = [];
    
    // Fungsi untuk mengecek apakah area sudah terisi
    function isAreaOccupied(x, y, width, height) {
        const padding = 10; // Jarak antar kata
        for (const area of occupiedAreas) {
            if (
                x < area.x + area.width + padding &&
                x + width + padding > area.x &&
                y < area.y + area.height + padding &&
                y + height + padding > area.y
            ) {
                return true; // Terjadi tumpang tindih
            }
        }
        return false;
    }
    
    // Posisi layout dengan pengecekan tumpang tindih
    const centerX = width / 2;
    const centerY = height / 2;
    let angle = 0;
    let radius = 0;
    const increment = 0.5;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Gambar kata-kata
    for (let i = 0; i < topWords.length; i++) {
        const word = topWords[i];
        
        // Pilih warna berdasarkan posisi di spiral
        const hue = (i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.font = `bold ${word.size}px Arial`;
        
        // Ukur dimensi teks
        const metrics = ctx.measureText(word.text);
        const wordWidth = metrics.width;
        const wordHeight = word.size * 1.2; // Perkiraan tinggi teks
        
        // Cari posisi yang tidak tumpang tindih
        let placed = false;
        let attempts = 0;
        const maxAttempts = 200;
        
        while (!placed && attempts < maxAttempts) {
            // Hitung posisi spiral
            const x = centerX + (radius * Math.cos(angle));
            const y = centerY + (radius * Math.sin(angle));
            
            // Rotasi text (hanya horizontal untuk mengurangi tumpang tindih)
            const rotation = 0; // Hilangkan rotasi untuk mengurangi tumpang tindih
            
            // Cek apakah posisi ini tersedia
            if (
                x - wordWidth/2 > 10 && 
                x + wordWidth/2 < width - 10 && 
                y - wordHeight/2 > 10 && 
                y + wordHeight/2 < height - 10 && 
                !isAreaOccupied(x - wordWidth/2, y - wordHeight/2, wordWidth, wordHeight)
            ) {
                // Posisi tersedia, gambar kata
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                
                // Tambahkan shadow untuk kedalaman
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Gambar teks
                ctx.fillText(word.text, 0, 0);
                ctx.restore();
                
                // Tandai area ini sebagai terisi
                occupiedAreas.push({
                    x: x - wordWidth/2,
                    y: y - wordHeight/2,
                    width: wordWidth,
                    height: wordHeight
                });
                
                placed = true;
            }
            
            // Pindah ke posisi berikutnya di spiral
            angle += increment;
            radius += width / (150 * Math.sqrt(topWords.length));
            attempts++;
        }
        
        // Jika tidak bisa menempatkan kata setelah banyak percobaan, lewati
        if (!placed) {
            console.log(`Tidak bisa menempatkan kata: ${word.text}`);
        }
    }
    
    // Tambahkan watermark/caption
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('Kanata Bot WordCloud', width - 20, height - 20);
    
    return canvas.toBuffer();
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
            caption: '✨ *Word Cloud Generator*\n\n' +
                     `📊 Menampilkan kata-kata populer dari teks dengan panjang ${text.length} karakter.`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error generating word cloud:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat word cloud');
        await m.react('❌');
    }
};

export const help = {
    name: "wordcloud",
    description: "Buat visualisasi kata-kata populer dari teks panjang",
    usage: ".wordcloud <teks panjang> atau reply ke pesan",
    example: ".wordcloud Lorem ipsum dolor sit amet..."
}; 