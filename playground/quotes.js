// Inisialisasi canvas dan konteks
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Mengatur ukuran canvas
canvas.width = 1200;
canvas.height = 1600;

// Konfigurasi tema
const themes = {
    default: {
        gradient: {
            start: '#3498db',
            end: '#8e44ad'
        },
        font: {
            title: 'bold 80px Montserrat, Arial',
            date: 'bold 300px Montserrat, Arial',
            day: '60px Montserrat, Arial',
            quote: '40px Roboto, Arial',
            footer: '30px Roboto, Arial'
        },
        colors: {
            text: '#ffffff',
            quoteBox: 'rgba(255, 255, 255, 0.2)'
        }
    },
    dark: {
        gradient: {
            start: '#2c3e50',
            end: '#34495e'
        },
        font: {
            title: 'bold 80px Montserrat, Arial',
            date: 'bold 300px Montserrat, Arial',
            day: '60px Montserrat, Arial',
            quote: '40px Roboto, Arial',
            footer: '30px Roboto, Arial'
        },
        colors: {
            text: '#ecf0f1',
            quoteBox: 'rgba(255, 255, 255, 0.15)'
        }
    },
    nature: {
        gradient: {
            start: '#27ae60',
            end: '#2ecc71'
        },
        font: {
            title: 'bold 80px Montserrat, Arial',
            date: 'bold 300px Montserrat, Arial',
            day: '60px Montserrat, Arial',
            quote: '40px Roboto, Arial',
            footer: '30px Roboto, Arial'
        },
        colors: {
            text: '#ffffff',
            quoteBox: 'rgba(255, 255, 255, 0.2)'
        }
    }
};

// Fungsi untuk membuat kalender
function createCalendar(quote, options = {}) {
    const {
        backgroundUrl = null,
        theme = 'default',
        showWeather = false,
        location = 'Jakarta',
        animation = true
    } = options;
    
    // Pilih tema
    const currentTheme = themes[theme] || themes.default;
    
    // Membersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background gradient default
    if (!backgroundUrl) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, currentTheme.gradient.start);
        gradient.addColorStop(1, currentTheme.gradient.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render konten kalender
        renderCalendarContent(quote, currentTheme, showWeather, location);
    } else {
        // Jika ada background image
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Overlay transparan untuk readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Render konten kalender setelah gambar dimuat
            renderCalendarContent(quote, currentTheme, showWeather, location);
        };
        img.src = backgroundUrl;
        return; // Keluar dari fungsi karena rendering akan dilanjutkan setelah gambar dimuat
    }
    
    // Efek animasi jika diaktifkan
    if (animation) {
        addAnimationEffects();
    }
}

// Fungsi untuk merender konten kalender
function renderCalendarContent(quote, theme, showWeather, location) {
    // Set tanggal dan waktu
    const now = new Date();
    
    // Header dengan bulan dan tahun
    ctx.font = theme.font.title;
    ctx.fillStyle = theme.colors.text;
    ctx.textAlign = 'center';
    
    const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
    ctx.fillText(monthNames[now.getMonth()] + ' ' + now.getFullYear(), canvas.width/2, 150);
    
    // Tanggal dengan ukuran besar
    ctx.font = theme.font.date;
    ctx.fillText(now.getDate().toString().padStart(2, '0'), canvas.width/2, 500);
    
    // Hari
    ctx.font = theme.font.day;
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    ctx.fillText(dayNames[now.getDay()], canvas.width/2, 600);
    
    // Menampilkan cuaca jika diaktifkan
    if (showWeather) {
        renderWeatherInfo(location, 650);
    }
    
    // Border untuk quote
    const quoteBoxMargin = 100;
    const quoteBoxWidth = canvas.width - (quoteBoxMargin * 2);
    const quoteBoxHeight = 400;
    const quoteBoxY = 800;
    
    // Membuat kotak quote dengan sudut melengkung
    ctx.fillStyle = theme.colors.quoteBox;
    roundRect(ctx, quoteBoxMargin, quoteBoxY, quoteBoxWidth, quoteBoxHeight, 20);
    
    // Quote
    ctx.fillStyle = theme.colors.text;
    ctx.font = theme.font.quote;
    
    // Word wrap untuk quote
    const maxWidth = quoteBoxWidth - 80;
    const words = quote.split(' ');
    let line = '';
    const lines = [];
    
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
    let y = quoteBoxY + 100;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width/2, y);
        y += 60;
    }
    
    // Footer
    ctx.font = theme.font.footer;
    ctx.fillText('Powered by Kanata Bot', canvas.width/2, 1500);
    
    // Tambahkan watermark
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('v2.0', canvas.width - 50, canvas.height - 20);
}

// Fungsi untuk menggambar persegi panjang dengan sudut melengkung
function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
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

// Fungsi untuk menampilkan informasi cuaca (simulasi)
function renderWeatherInfo(location, yPosition) {
    // Dalam implementasi nyata, ini akan mengambil data dari API cuaca
    const weatherIcons = {
        'cerah': '☀️',
        'berawan': '⛅',
        'hujan': '🌧️',
        'badai': '⛈️'
    };
    
    const randomWeather = Object.keys(weatherIcons)[Math.floor(Math.random() * Object.keys(weatherIcons).length)];
    const temperature = Math.floor(Math.random() * 10) + 25; // 25-34°C
    
    ctx.font = '40px Arial';
    ctx.fillText(`${location}: ${weatherIcons[randomWeather]} ${temperature}°C`, canvas.width/2, yPosition);
}

// Fungsi untuk menambahkan efek animasi (simulasi)
function addAnimationEffects() {
    // Dalam implementasi nyata, ini akan menggunakan requestAnimationFrame
    // Untuk demo, kita hanya menambahkan beberapa elemen dekoratif
    
    // Menambahkan beberapa titik berkilau
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

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
    "Sukses adalah saat persiapan bertemu dengan kesempatan.",
    "Hidup ini singkat. Jangan sia-siakan waktumu untuk hal yang tidak penting.",
    "Kesuksesan adalah perjalanan, bukan tujuan akhir.",
    "Jangan pernah menyerah pada mimpimu, karena mimpi memberimu tujuan hidup.",
    "Belajarlah dari kesalahan orang lain. Kamu tidak bisa hidup cukup lama untuk melakukan semua kesalahan itu sendiri.",
    "Keberanian bukanlah tidak adanya rasa takut, tetapi kemenangan atas rasa takut itu."
];

// Fungsi untuk mengubah tema kalender
function changeTheme(themeName) {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    createCalendar(randomQuote, { theme: themeName });
}

// Membuat kalender dengan quote random saat halaman dimuat
window.onload = function() {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    createCalendar(randomQuote, { 
        theme: 'default',
        showWeather: true,
        animation: true
    });
    
    // Tambahkan kontrol tema jika diinginkan
    addThemeControls();
};

// Fungsi untuk menambahkan kontrol tema (opsional)
function addThemeControls() {
    const container = document.querySelector('.container');
    
    const controlPanel = document.createElement('div');
    controlPanel.style.position = 'absolute';
    controlPanel.style.bottom = '10px';
    controlPanel.style.left = '10px';
    controlPanel.style.display = 'flex';
    controlPanel.style.gap = '10px';
    
    const themes = ['default', 'dark', 'nature'];
    
    themes.forEach(theme => {
        const button = document.createElement('button');
        button.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        button.onclick = () => changeTheme(theme);
        button.style.padding = '5px 10px';
        button.style.cursor = 'pointer';
        controlPanel.appendChild(button);
    });
    
    container.appendChild(controlPanel);
}


