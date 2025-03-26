function drawPrayerTimeNotification() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas untuk rasio 16:9 dalam orientasi potrait
    canvas.width = 450;
    canvas.height = 500;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efek bintang-bintang kecil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gambar bulan sabit
    ctx.fillStyle = '#f9f9f9';
    ctx.beginPath();
    ctx.arc(350, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e3c72';
    ctx.beginPath();
    ctx.arc(370, 90, 40, 0, Math.PI * 2);
    ctx.fill();

    // Panel notifikasi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(50, 150, 350, 200);
    
    // Judul notifikasi
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Waktu Shalat', 225, 190);

    // Garis pemisah
    ctx.strokeStyle = '#1e3c72';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 205);
    ctx.lineTo(350, 205);
    ctx.stroke();

    // Waktu shalat
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentDate.toLocaleDateString('id-ID', options);

    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Maghrib', 225, 245);

    ctx.fillStyle = '#2a5298';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('17:45 WIB', 225, 280);

    ctx.fillStyle = '#555555';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(dateString, 225, 315);

    // Tombol tutup
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(375, 170, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', 375, 175);
  }
}

drawPrayerTimeNotification();
