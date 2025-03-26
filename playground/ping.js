function drawPingTest() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌐 Hasil Ping Test 🌐', canvas.width / 2, 50);

    // Panel utama
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 80, canvas.width - 100, canvas.height - 150);
    
    // Data ping
    const pingResults = [
      { host: 'google.com', status: 'Sukses', time: '15 ms', packets: '4/4 (100%)' },
      { host: 'facebook.com', status: 'Sukses', time: '22 ms', packets: '4/4 (100%)' },
      { host: 'twitter.com', status: 'Sukses', time: '35 ms', packets: '4/4 (100%)' },
      { host: 'amazon.com', status: 'Sukses', time: '78 ms', packets: '3/4 (75%)' },
      { host: 'unreachable.local', status: 'Gagal', time: 'Timeout', packets: '0/4 (0%)' }
    ];

    // Header tabel
    let yPos = 120;
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Host', 80, yPos);
    ctx.fillText('Status', 300, yPos);
    ctx.fillText('Waktu', 450, yPos);
    ctx.fillText('Paket', 600, yPos);
    
    // Garis pemisah header
    yPos += 10;
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, yPos);
    ctx.lineTo(canvas.width - 80, yPos);
    ctx.stroke();
    
    // Menampilkan data ping
    yPos += 30;
    
    pingResults.forEach(result => {
      // Host
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(result.host, 80, yPos);
      
      // Status
      ctx.fillStyle = result.status === 'Sukses' ? '#2ecc71' : '#e74c3c';
      ctx.fillText(result.status, 300, yPos);
      
      // Waktu
      ctx.fillStyle = '#ecf0f1';
      ctx.fillText(result.time, 450, yPos);
      
      // Paket
      ctx.fillText(result.packets, 600, yPos);
      
      yPos += 40;
    });

    // Statistik ringkasan
    yPos += 20;
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Ringkasan:', 80, yPos);
    
    yPos += 30;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('• Rata-rata waktu respons: 37.5 ms', 100, yPos);
    
    yPos += 30;
    ctx.fillText('• Paket terkirim: 20', 100, yPos);
    
    yPos += 30;
    ctx.fillText('• Paket diterima: 15 (75%)', 100, yPos);
    
    yPos += 30;
    ctx.fillText('• Paket hilang: 5 (25%)', 100, yPos);
    
    // Waktu pengujian
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pengujian dilakukan pada: ' + new Date().toLocaleString('id-ID'), canvas.width / 2, canvas.height - 30);
  }
}

drawPingTest();
