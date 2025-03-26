function drawAFKInterface() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pola geometris
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 40 + 5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`;
      ctx.fill();
    }

    // Judul
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AFK MODE', canvas.width / 2, 120);

    // Ikon AFK
    ctx.fillStyle = '#e74c3c';
    ctx.font = '120px Arial, sans-serif';
    ctx.fillText('🚶', canvas.width / 2, 250);

    // Status
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Status: Tidak Aktif', canvas.width / 2, 320);

    // Alasan
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('Alasan: Sedang istirahat sebentar', canvas.width / 2, 360);

    // Waktu
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('Waktu AFK: 00:15:32', canvas.width / 2, 410);

    // Panel notifikasi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(150, 440, 500, 100);
    
    // Judul panel
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Notifikasi Diterima:', 170, 470);
    
    // Notifikasi
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('• Ahmad: Halo, kamu ada?', 170, 500);
    ctx.fillText('• Grup Kerja: Meeting dimulai 10 menit lagi', 170, 525);
  }
}

drawAFKInterface();

