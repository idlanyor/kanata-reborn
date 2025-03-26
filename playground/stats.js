function drawSystemInfo() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 800;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌐 Server System Information 🌐', canvas.width / 2, 50);

    // Panel utama
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 80, canvas.width - 100, canvas.height - 130);
    
    // Data sistem berdasarkan stats.js
    const systemInfo = [
      { label: '💻 OS', value: 'Linux (linux 5.15.0-58-generic)' },
      { label: '🧠 Total RAM', value: '32.00 GB' },
      { label: '📊 RAM Terpakai', value: '12.48 GB (39.00%)' },
      { label: '💾 RAM Tersedia', value: '19.52 GB (61.00%)' },
      { label: '⏱️ Uptime', value: '72 jam 15 menit 30 detik' },
      { label: '🖥️ CPU Info', value: 'Intel Core i7-12700K (12 core, 20 thread)' },
      { label: '📉 CPU Usage', value: '35.75%' }
    ];

    // Menampilkan data sistem
    let yPos = 120;
    ctx.textAlign = 'left';
    
    systemInfo.forEach(item => {
      // Label
      ctx.fillStyle = '#3498db';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(item.label + ':', 80, yPos);
      
      // Nilai
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(item.value, 300, yPos);
      
      yPos += 40;
    });

    // Informasi Jaringan
    yPos += 20;
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('🌐 Network Interfaces:', 80, yPos);
    
    yPos += 30;
    
    // Interface 1
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('🔹 eth0 (IPv4):', 100, yPos);
    
    yPos += 25;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('▪️ IP Address: 192.168.1.100', 120, yPos);
    
    yPos += 25;
    ctx.fillText('▪️ Netmask: 255.255.255.0', 120, yPos);
    
    yPos += 25;
    ctx.fillText('▪️ MAC Address: 00:1A:2B:3C:4D:5E', 120, yPos);
    
    // Network Traffic
    yPos += 40;
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('📊 Network Traffic:', 80, yPos);
    
    yPos += 30;
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('🔹 Interface 1:', 100, yPos);
    
    yPos += 25;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('▪️ Received: 256.75 MB', 120, yPos);
    
    yPos += 25;
    ctx.fillText('▪️ Transmitted: 128.42 MB', 120, yPos);
    
    yPos += 25;
    ctx.fillText('▪️ Speed: 5 ms', 120, yPos);

    // Grafik penggunaan CPU
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, canvas.height - 40, canvas.width - 100, 30);
    
    // Penggunaan CPU (35.75%)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(50, canvas.height - 40, (canvas.width - 100) * 0.3575, 30);
    
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Penggunaan CPU: 35.75%', canvas.width / 2, canvas.height - 20);
  }
}

drawSystemInfo();


