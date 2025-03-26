// Inisialisasi canvas dan konteks untuk informasi kick
const kickCanvas = document.createElement('canvas');
const kickCtx = kickCanvas.getContext('2d');

// Mengatur ukuran canvas
kickCanvas.width = 800;
kickCanvas.height = 400;

/**
 * Fungsi untuk membuat visualisasi informasi kick
 * @param {Object} data - Data informasi kick
 * @param {Object} options - Opsi konfigurasi
 * @returns {HTMLCanvasElement} - Canvas yang berisi visualisasi
 */
function createKickInfoCanvas(data, options = {}) {
    // Opsi default
    const defaultOptions = {
        theme: 'default',
        showDetails: true,
        animation: false,
        title: 'Informasi Kick Member'
    };
    
    // Menggabungkan opsi default dengan opsi yang diberikan
    const config = { ...defaultOptions, ...options };
    
    // Tema untuk visualisasi
    const themes = {
        default: {
            background: {
                start: '#2c3e50',
                end: '#34495e'
            },
            font: {
                title: 'bold 28px Montserrat, Arial',
                subtitle: 'bold 20px Montserrat, Arial',
                info: '16px Roboto, Arial',
                footer: '14px Roboto, Arial'
            },
            colors: {
                text: '#ecf0f1',
                highlight: '#e74c3c',
                success: '#2ecc71',
                panel: 'rgba(255, 255, 255, 0.1)'
            }
        },
        light: {
            background: {
                start: '#ecf0f1',
                end: '#bdc3c7'
            },
            font: {
                title: 'bold 28px Montserrat, Arial',
                subtitle: 'bold 20px Montserrat, Arial',
                info: '16px Roboto, Arial',
                footer: '14px Roboto, Arial'
            },
            colors: {
                text: '#2c3e50',
                highlight: '#c0392b',
                success: '#27ae60',
                panel: 'rgba(0, 0, 0, 0.1)'
            }
        }
    };
    
    // Menggunakan tema yang dipilih
    const currentTheme = themes[config.theme] || themes.default;
    
    // Membersihkan canvas
    kickCtx.clearRect(0, 0, kickCanvas.width, kickCanvas.height);
    
    // Menggambar background gradient
    const gradient = kickCtx.createLinearGradient(0, 0, 0, kickCanvas.height);
    gradient.addColorStop(0, currentTheme.background.start);
    gradient.addColorStop(1, currentTheme.background.end);
    kickCtx.fillStyle = gradient;
    kickCtx.fillRect(0, 0, kickCanvas.width, kickCanvas.height);
    
    // Menggambar judul
    kickCtx.font = currentTheme.font.title;
    kickCtx.fillStyle = currentTheme.colors.text;
    kickCtx.textAlign = 'center';
    kickCtx.fillText(config.title, kickCanvas.width/2, 40);
    
    // Menggambar panel informasi
    const panelX = 50;
    const panelY = 70;
    const panelWidth = kickCanvas.width - 100;
    const panelHeight = kickCanvas.height - 120;
    
    // Menggambar panel dengan sudut melengkung
    kickCtx.fillStyle = currentTheme.colors.panel;
    roundedRect(kickCtx, panelX, panelY, panelWidth, panelHeight, 10);
    
    // Menggambar informasi kick
    if (config.showDetails && data) {
        renderKickInfo(data, currentTheme, panelX, panelY);
    }
    
    // Menambahkan efek animasi jika diaktifkan
    if (config.animation) {
        addKickAnimationEffects(currentTheme);
    }
    
    // Menambahkan footer
    kickCtx.font = currentTheme.font.footer;
    kickCtx.fillStyle = currentTheme.colors.text;
    kickCtx.textAlign = 'right';
    kickCtx.fillText('Group Manager v1.0', kickCanvas.width - 20, kickCanvas.height - 20);
    
    return kickCanvas;
}

/**
 * Fungsi untuk merender informasi kick
 * @param {Object} data - Data informasi kick
 * @param {Object} theme - Tema yang digunakan
 * @param {number} panelX - Posisi X panel
 * @param {number} panelY - Posisi Y panel
 */
function renderKickInfo(data, theme, panelX, panelY) {
    // Menggambar ikon
    const iconSize = 80;
    const iconX = kickCanvas.width/2 - iconSize/2;
    const iconY = panelY + 30;
    
    // Menggambar ikon kick (lingkaran dengan simbol X)
    kickCtx.fillStyle = theme.colors.highlight;
    kickCtx.beginPath();
    kickCtx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2);
    kickCtx.fill();
    
    // Menggambar simbol X
    kickCtx.strokeStyle = '#ffffff';
    kickCtx.lineWidth = 6;
    kickCtx.beginPath();
    kickCtx.moveTo(iconX + iconSize/4, iconY + iconSize/4);
    kickCtx.lineTo(iconX + iconSize*3/4, iconY + iconSize*3/4);
    kickCtx.moveTo(iconX + iconSize*3/4, iconY + iconSize/4);
    kickCtx.lineTo(iconX + iconSize/4, iconY + iconSize*3/4);
    kickCtx.stroke();
    
    // Menggambar informasi
    kickCtx.font = theme.font.subtitle;
    kickCtx.fillStyle = theme.colors.text;
    kickCtx.textAlign = 'center';
    kickCtx.fillText('Member Dikeluarkan', kickCanvas.width/2, iconY + iconSize + 30);
    
    // Informasi detail
    kickCtx.font = theme.font.info;
    kickCtx.textAlign = 'left';
    
    let yOffset = iconY + iconSize + 60;
    
    // Nama member
    kickCtx.fillText(`Nama: ${data.memberName || 'Tidak diketahui'}`, panelX + 30, yOffset);
    yOffset += 30;
    
    // ID member
    kickCtx.fillText(`ID: ${data.memberId || 'Tidak diketahui'}`, panelX + 30, yOffset);
    yOffset += 30;
    
    // Waktu kick
    const kickTime = data.time ? new Date(data.time).toLocaleString('id-ID') : new Date().toLocaleString('id-ID');
    kickCtx.fillText(`Waktu: ${kickTime}`, panelX + 30, yOffset);
    yOffset += 30;
    
    // Admin yang melakukan kick
    kickCtx.fillText(`Oleh Admin: ${data.adminName || 'Tidak diketahui'}`, panelX + 30, yOffset);
    yOffset += 30;
    
    // Alasan kick (jika ada)
    if (data.reason) {
        kickCtx.fillText(`Alasan: ${data.reason}`, panelX + 30, yOffset);
    }
    
    // Status
    kickCtx.textAlign = 'center';
    kickCtx.font = theme.font.subtitle;
    kickCtx.fillStyle = theme.colors.success;
    kickCtx.fillText('Berhasil', kickCanvas.width/2, kickCanvas.height - 50);
}

/**
 * Fungsi untuk menambahkan efek animasi
 * @param {Object} theme - Tema yang digunakan
 */
function addKickAnimationEffects(theme) {
    // Menambahkan beberapa titik berkilau
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * kickCanvas.width;
        const y = Math.random() * kickCanvas.height;
        const size = Math.random() * 2 + 1;
        
        kickCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        kickCtx.beginPath();
        kickCtx.arc(x, y, size, 0, Math.PI * 2);
        kickCtx.fill();
    }
}

/**
 * Fungsi untuk menggambar persegi dengan sudut melengkung
 * @param {CanvasRenderingContext2D} ctx - Konteks canvas
 * @param {number} x - Posisi X
 * @param {number} y - Posisi Y
 * @param {number} width - Lebar
 * @param {number} height - Tinggi
 * @param {number} radius - Radius sudut
 */
function roundedRect(ctx, x, y, width, height, radius) {
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

// Contoh penggunaan:
const kickData = {
    memberName: 'John Doe',
    memberId: '6281234567890@s.whatsapp.net',
    time: new Date().toISOString(),
    adminName: 'Admin Group',
    reason: 'Melanggar peraturan grup'
};
const kickInfo = createKickInfoCanvas(kickData, { theme: 'default', showDetails: true });
document.body.appendChild(kickInfo);

