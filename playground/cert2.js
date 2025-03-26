function drawSertifikatKompetensiV2() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006064');
    gradient.addColorStop(1, '#00838f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pola geometris
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
      ctx.fill();
    }

    // Border sertifikat
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.8)';
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Border dalam
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Logo (simulasi)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 90, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffc107';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Judul
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT KOMPETENSI', canvas.width / 2, 160);
    
    // Garis bawah judul
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 170);
    ctx.lineTo(canvas.width / 2 + 200, 170);
    ctx.stroke();

    // Teks diberikan kepada
    ctx.fillStyle = '#e0f7fa';
    ctx.font = 'italic 20px Arial, sans-serif';
    ctx.fillText('Diberikan Kepada:', canvas.width / 2, 210);

    // Nama peserta
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('BUDI SANTOSO', canvas.width / 2, 260);

    // Nomor sertifikat
    ctx.fillStyle = '#ffc107';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('No. Sertifikat: SKP/2023/67890', canvas.width / 2, 290);

    // Deskripsi kompetensi
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Telah menyelesaikan dan dinyatakan KOMPETEN dalam', canvas.width / 2, 330);
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('Pengembangan Aplikasi Mobile dengan Flutter', canvas.width / 2, 370);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Sesuai dengan Standar Kompetensi Kerja Nasional Indonesia', canvas.width / 2, 400);

    // Tanggal
    ctx.fillStyle = '#e0f7fa';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Jakarta, 20 Desember 2023', canvas.width - 200, 450);

    // Tanda tangan
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Direktur Lembaga Sertifikasi', canvas.width - 200, 510);
    
    // Garis tanda tangan
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 300, 490);
    ctx.lineTo(canvas.width - 100, 490);
    ctx.stroke();

    // Stempel (simulasi)
    ctx.beginPath();
    ctx.arc(canvas.width - 200, 470, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // QR Code (simulasi)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 440, 70, 70);
    
    // Teks validasi
    ctx.fillStyle = '#b2ebf2';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sertifikat ini dapat diverifikasi di sertifikat.kominfo.go.id', canvas.width / 2, canvas.height - 30);
    
    // Masa berlaku
    ctx.fillStyle = '#e0f7fa';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Berlaku hingga: 20 Desember 2026', 150, 530);
  }
}

drawSertifikatKompetensiV2();
