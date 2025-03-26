function drawSertifikatKompetensiV3() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a148c');
    gradient.addColorStop(1, '#7b1fa2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pola geometris
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.07})`;
      ctx.fill();
    }

    // Border sertifikat
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
    
    // Border dalam
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // Logo (simulasi)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 90, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Judul
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT KOMPETENSI', canvas.width / 2, 160);
    
    // Garis bawah judul
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 175);
    ctx.lineTo(canvas.width / 2 + 250, 175);
    ctx.stroke();

    // Teks diberikan kepada
    ctx.fillStyle = '#e1bee7';
    ctx.font = 'italic 22px Arial, sans-serif';
    ctx.fillText('Diberikan Kepada:', canvas.width / 2, 210);

    // Nama peserta
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.fillText('BUDI SANTOSO', canvas.width / 2, 260);

    // Nomor sertifikat
    ctx.fillStyle = '#ffd700';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('No. Sertifikat: SKP/2024/78901', canvas.width / 2, 300);

    // Deskripsi kompetensi
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Telah menyelesaikan dan dinyatakan KOMPETEN dalam', canvas.width / 2, 340);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('Pengembangan Aplikasi Web dengan React.js', canvas.width / 2, 380);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Sesuai dengan Standar Kompetensi Kerja Nasional Indonesia', canvas.width / 2, 410);

    // Tanggal
    ctx.fillStyle = '#e1bee7';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Jakarta, 10 Februari 2024', canvas.width - 100, 460);

    // Tanda tangan
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Direktur Lembaga Sertifikasi', canvas.width - 100, 520);
    
    // Garis tanda tangan
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 250, 500);
    ctx.lineTo(canvas.width - 50, 500);
    ctx.stroke();

    // Stempel (simulasi)
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 480, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // QR Code (simulasi)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 450, 80, 80);
    
    // Teks validasi
    ctx.fillStyle = '#e1bee7';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sertifikat ini dapat diverifikasi di sertifikat.kominfo.go.id', canvas.width / 2, canvas.height - 25);
    
    // Masa berlaku
    ctx.fillStyle = '#e1bee7';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Berlaku hingga: 10 Februari 2027', 100, 550);
  }
}

drawSertifikatKompetensiV3();
