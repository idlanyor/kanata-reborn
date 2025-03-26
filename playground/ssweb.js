function drawSSWeb() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 Screenshot Web 📸', canvas.width / 2, 50);

    // Panel URL
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 80, canvas.width - 100, 60);
    
    // Kotak URL
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 90, 500, 40);
    
    // Placeholder teks URL
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('https://www.example.com', 110, 115);
    
    // Tombol screenshot
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(610, 90, 100, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Capture', 660, 115);

    // Panel hasil screenshot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 160, canvas.width - 100, canvas.height - 220);
    
    // Placeholder screenshot
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(70, 180, canvas.width - 140, canvas.height - 260);
    
    // Ikon placeholder
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🖥️', canvas.width / 2, canvas.height / 2 - 40);
    
    // Teks placeholder
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Screenshot akan ditampilkan di sini', canvas.width / 2, canvas.height / 2 + 20);
    
    // Panel opsi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, canvas.height - 50, canvas.width - 100, 40);
    
    // Opsi format
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Format: PNG', 70, canvas.height - 25);
    
    // Opsi resolusi
    ctx.fillText('Resolusi: 1920x1080', 200, canvas.height - 25);
    
    // Opsi delay
    ctx.fillText('Delay: 0 detik', 350, canvas.height - 25);
    
    // Tombol unduh
    ctx.fillStyle = '#3498db';
    ctx.fillRect(canvas.width - 150, canvas.height - 45, 100, 30);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Unduh', canvas.width - 100, canvas.height - 25);
  }
}

drawSSWeb();
