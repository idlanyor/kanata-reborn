// Inisialisasi canvas dan konteks untuk sistem snapshot realtime
const snapshotCanvas = document.createElement('canvas');
const snapshotCtx = snapshotCanvas.getContext('2d');

// Mengatur ukuran canvas
snapshotCanvas.width = 1200;
snapshotCanvas.height = 800;

// Fungsi untuk membuat snapshot sistem
function createSystemSnapshot(data, options = {}) {
    // Opsi default
    const defaultOptions = {
        theme: 'default',
        showMetrics: true,
        animation: false,
        title: 'Sistem Snapshot'
    };
    
    // Menggabungkan opsi default dengan opsi yang diberikan
    const config = { ...defaultOptions, ...options };
    
    // Tema untuk snapshot
    const themes = {
        default: {
            background: {
                start: '#2c3e50',
                end: '#34495e'
            },
            font: {
                title: 'bold 36px Montserrat, Arial',
                subtitle: 'bold 24px Montserrat, Arial',
                metrics: '18px Roboto, Arial',
                timestamp: '16px Roboto, Arial'
            },
            colors: {
                text: '#ecf0f1',
                metrics: {
                    good: '#2ecc71',
                    warning: '#f39c12',
                    critical: '#e74c3c',
                    normal: '#3498db'
                },
                panel: 'rgba(255, 255, 255, 0.1)'
            }
        },
        light: {
            background: {
                start: '#ecf0f1',
                end: '#bdc3c7'
            },
            font: {
                title: 'bold 36px Montserrat, Arial',
                subtitle: 'bold 24px Montserrat, Arial',
                metrics: '18px Roboto, Arial',
                timestamp: '16px Roboto, Arial'
            },
            colors: {
                text: '#2c3e50',
                metrics: {
                    good: '#27ae60',
                    warning: '#d35400',
                    critical: '#c0392b',
                    normal: '#2980b9'
                },
                panel: 'rgba(0, 0, 0, 0.1)'
            }
        }
    };
    
    // Menggunakan tema yang dipilih
    const currentTheme = themes[config.theme] || themes.default;
    
    // Membersihkan canvas
    snapshotCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    
    // Menggambar background gradient
    const gradient = snapshotCtx.createLinearGradient(0, 0, 0, snapshotCanvas.height);
    gradient.addColorStop(0, currentTheme.background.start);
    gradient.addColorStop(1, currentTheme.background.end);
    snapshotCtx.fillStyle = gradient;
    snapshotCtx.fillRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    
    // Menggambar judul
    snapshotCtx.font = currentTheme.font.title;
    snapshotCtx.fillStyle = currentTheme.colors.text;
    snapshotCtx.textAlign = 'center';
    snapshotCtx.fillText(config.title, snapshotCanvas.width/2, 50);
    
    // Menggambar timestamp
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    snapshotCtx.font = currentTheme.font.timestamp;
    snapshotCtx.textAlign = 'right';
    snapshotCtx.fillText(timestamp, snapshotCanvas.width - 20, 30);
    
    // Menggambar panel metrik jika diaktifkan
    if (config.showMetrics) {
        renderMetricsPanel(data, currentTheme);
    }
    
    // Menggambar grafik sistem
    renderSystemGraphs(data, currentTheme);
    
    // Menambahkan efek animasi jika diaktifkan
    if (config.animation) {
        addSnapshotAnimationEffects(currentTheme);
    }
    
    // Menambahkan watermark
    snapshotCtx.font = '14px Arial';
    snapshotCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    snapshotCtx.textAlign = 'right';
    snapshotCtx.fillText('System Monitor v1.0', snapshotCanvas.width - 20, snapshotCanvas.height - 20);
    
    return snapshotCanvas;
}

// Fungsi untuk merender panel metrik
function renderMetricsPanel(data, theme) {
    const panelX = 50;
    const panelY = 100;
    const panelWidth = 350;
    const panelHeight = 600;
    
    // Menggambar panel dengan sudut melengkung
    snapshotCtx.fillStyle = theme.colors.panel;
    roundedRect(snapshotCtx, panelX, panelY, panelWidth, panelHeight, 10);
    
    // Judul panel
    snapshotCtx.font = theme.font.subtitle;
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.textAlign = 'left';
    snapshotCtx.fillText('Metrik Sistem', panelX + 20, panelY + 40);
    
    // Menggambar metrik
    snapshotCtx.font = theme.font.metrics;
    let yOffset = panelY + 90;
    
    // CPU Usage
    const cpuUsage = data.cpu || Math.floor(Math.random() * 100);
    const cpuColor = getMetricColor(cpuUsage, theme);
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('CPU Usage:', panelX + 20, yOffset);
    snapshotCtx.fillStyle = cpuColor;
    snapshotCtx.fillText(`${cpuUsage}%`, panelX + 200, yOffset);
    drawProgressBar(panelX + 20, yOffset + 10, 310, 15, cpuUsage, cpuColor, theme);
    
    // Memory Usage
    yOffset += 70;
    const memoryUsage = data.memory || Math.floor(Math.random() * 100);
    const memoryColor = getMetricColor(memoryUsage, theme);
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('Memory Usage:', panelX + 20, yOffset);
    snapshotCtx.fillStyle = memoryColor;
    snapshotCtx.fillText(`${memoryUsage}%`, panelX + 200, yOffset);
    drawProgressBar(panelX + 20, yOffset + 10, 310, 15, memoryUsage, memoryColor, theme);
    
    // Disk Usage
    yOffset += 70;
    const diskUsage = data.disk || Math.floor(Math.random() * 100);
    const diskColor = getMetricColor(diskUsage, theme);
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('Disk Usage:', panelX + 20, yOffset);
    snapshotCtx.fillStyle = diskColor;
    snapshotCtx.fillText(`${diskUsage}%`, panelX + 200, yOffset);
    drawProgressBar(panelX + 20, yOffset + 10, 310, 15, diskUsage, diskColor, theme);
    
    // Network Usage
    yOffset += 70;
    const networkUsage = data.network || Math.floor(Math.random() * 100);
    const networkColor = getMetricColor(networkUsage, theme);
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('Network Usage:', panelX + 20, yOffset);
    snapshotCtx.fillStyle = networkColor;
    snapshotCtx.fillText(`${networkUsage}%`, panelX + 200, yOffset);
    drawProgressBar(panelX + 20, yOffset + 10, 310, 15, networkUsage, networkColor, theme);
    
    // Uptime
    yOffset += 70;
    const uptime = data.uptime || Math.floor(Math.random() * 1000);
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('Uptime:', panelX + 20, yOffset);
    snapshotCtx.fillText(`${uptime} jam`, panelX + 200, yOffset);
    
    // Status Sistem
    yOffset += 70;
    const status = data.status || (Math.random() > 0.8 ? 'Warning' : 'Normal');
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.fillText('Status Sistem:', panelX + 20, yOffset);
    snapshotCtx.fillStyle = status === 'Normal' ? theme.colors.metrics.good : theme.colors.metrics.warning;
    snapshotCtx.fillText(status, panelX + 200, yOffset);
}

// Fungsi untuk merender grafik sistem
function renderSystemGraphs(data, theme) {
    const graphX = 450;
    const graphY = 100;
    const graphWidth = 700;
    const graphHeight = 300;
    
    // Panel grafik CPU
    snapshotCtx.fillStyle = theme.colors.panel;
    roundedRect(snapshotCtx, graphX, graphY, graphWidth, graphHeight, 10);
    
    // Judul grafik
    snapshotCtx.font = theme.font.subtitle;
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.textAlign = 'left';
    snapshotCtx.fillText('CPU Usage Over Time', graphX + 20, graphY + 40);
    
    // Menggambar grafik CPU (simulasi)
    drawLineGraph(
        graphX + 50, 
        graphY + 70, 
        graphWidth - 100, 
        graphHeight - 100, 
        generateRandomData(24), 
        theme.colors.metrics.normal,
        theme
    );
    
    // Panel grafik Memory
    const memGraphY = graphY + graphHeight + 50;
    snapshotCtx.fillStyle = theme.colors.panel;
    roundedRect(snapshotCtx, graphX, memGraphY, graphWidth, graphHeight, 10);
    
    // Judul grafik memory
    snapshotCtx.font = theme.font.subtitle;
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.textAlign = 'left';
    snapshotCtx.fillText('Memory Usage Over Time', graphX + 20, memGraphY + 40);
    
    // Menggambar grafik Memory (simulasi)
    drawLineGraph(
        graphX + 50, 
        memGraphY + 70, 
        graphWidth - 100, 
        graphHeight - 100, 
        generateRandomData(24), 
        theme.colors.metrics.warning,
        theme
    );
}

// Fungsi untuk menggambar progress bar
function drawProgressBar(x, y, width, height, percentage, color, theme) {
    // Background
    snapshotCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    roundedRect(snapshotCtx, x, y, width, height, height/2);
    
    // Progress
    snapshotCtx.fillStyle = color;
    if (percentage > 0) {
        const progressWidth = (width * percentage) / 100;
        roundedRect(snapshotCtx, x, y, progressWidth, height, height/2);
    }
}

// Fungsi untuk menggambar persegi dengan sudut melengkung
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

// Fungsi untuk mendapatkan warna berdasarkan nilai metrik
function getMetricColor(value, theme) {
    if (value < 60) return theme.colors.metrics.good;
    if (value < 85) return theme.colors.metrics.warning;
    return theme.colors.metrics.critical;
}

// Fungsi untuk menggambar grafik garis
function drawLineGraph(x, y, width, height, data, color, theme) {
    const dataPoints = data.length;
    const xStep = width / (dataPoints - 1);
    
    // Menggambar sumbu X dan Y
    snapshotCtx.strokeStyle = theme.colors.text;
    snapshotCtx.lineWidth = 1;
    
    // Sumbu Y
    snapshotCtx.beginPath();
    snapshotCtx.moveTo(x, y);
    snapshotCtx.lineTo(x, y + height);
    snapshotCtx.stroke();
    
    // Sumbu X
    snapshotCtx.beginPath();
    snapshotCtx.moveTo(x, y + height);
    snapshotCtx.lineTo(x + width, y + height);
    snapshotCtx.stroke();
    
    // Menggambar garis data
    snapshotCtx.strokeStyle = color;
    snapshotCtx.lineWidth = 3;
    snapshotCtx.beginPath();
    
    for (let i = 0; i < dataPoints; i++) {
        const dataX = x + (i * xStep);
        const dataY = y + height - (data[i] / 100 * height);
        
        if (i === 0) {
            snapshotCtx.moveTo(dataX, dataY);
        } else {
            snapshotCtx.lineTo(dataX, dataY);
        }
    }
    
    snapshotCtx.stroke();
    
    // Menggambar titik data
    for (let i = 0; i < dataPoints; i++) {
        const dataX = x + (i * xStep);
        const dataY = y + height - (data[i] / 100 * height);
        
        snapshotCtx.fillStyle = color;
        snapshotCtx.beginPath();
        snapshotCtx.arc(dataX, dataY, 4, 0, Math.PI * 2);
        snapshotCtx.fill();
    }
    
    // Label sumbu X (jam)
    snapshotCtx.fillStyle = theme.colors.text;
    snapshotCtx.font = '14px Arial';
    snapshotCtx.textAlign = 'center';
    
    for (let i = 0; i < dataPoints; i += 4) {
        const labelX = x + (i * xStep);
        snapshotCtx.fillText(`${i}h`, labelX, y + height + 20);
    }
}

// Fungsi untuk menambahkan efek animasi
function addSnapshotAnimationEffects(theme) {
    // Menambahkan beberapa titik berkilau
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * snapshotCanvas.width;
        const y = Math.random() * snapshotCanvas.height;
        const size = Math.random() * 2 + 1;
        
        snapshotCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        snapshotCtx.beginPath();
        snapshotCtx.arc(x, y, size, 0, Math.PI * 2);
        snapshotCtx.fill();
    }
}

// Fungsi untuk menghasilkan data acak untuk simulasi
function generateRandomData(points) {
    const data = [];
    let lastValue = 50;
    
    for (let i = 0; i < points; i++) {
        // Menghasilkan nilai yang bervariasi dari nilai sebelumnya
        const change = Math.random() * 20 - 10; // -10 hingga +10
        lastValue = Math.max(0, Math.min(100, lastValue + change));
        data.push(lastValue);
    }
    
    return data;
}

// Contoh penggunaan:
const systemData = {
    cpu: 75,
    memory: 60,
    disk: 85,
    network: 45,
    uptime: 72,
    status: 'Normal'
};
const snapshot = createSystemSnapshot(systemData, { theme: 'default', showMetrics: true });
document.body.appendChild(snapshot);



