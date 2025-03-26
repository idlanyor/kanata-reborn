function drawSertifikatKompetensi() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a5276');
    gradient.addColorStop(1, '#2874a6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pola abstrak
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 50 + 10,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.fill();
    }

    // Garis-garis abstrak
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, 0);
      ctx.lineTo(Math.random() * canvas.width, canvas.height);
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.lineWidth = Math.random() * 3;
      ctx.stroke();
    }

    // Border sertifikat dengan motif batik
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
    
    // Membuat border dasar
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Menambahkan motif batik pada border

    // Border dalam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Judul
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT KOMPETENSI', canvas.width / 2, 120);

    // Teks diberikan kepada
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 20px Arial, sans-serif';
    ctx.fillText('Diberikan Kepada:', canvas.width / 2, 180);

    // Nama peserta
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('AHMAD FAUZI', canvas.width / 2, 230);

    // Nomor sertifikat
    ctx.fillStyle = '#f1c40f';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('No. Sertifikat: SKP/2023/12345', canvas.width / 2, 270);

    // Deskripsi kompetensi
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Telah menyelesaikan dan dinyatakan KOMPETEN dalam', canvas.width / 2, 320);
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('Pengembangan Aplikasi Web Berbasis JavaScript', canvas.width / 2, 360);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Sesuai dengan Standar Kompetensi Kerja Nasional Indonesia', canvas.width / 2, 390);

    // Tanggal
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Jakarta, 15 November 2023', canvas.width / 2, 450);

    // Tanda tangan
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Direktur Lembaga Sertifikasi', canvas.width / 2, 510);
    
    // Garis tanda tangan
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 490);
    ctx.lineTo(canvas.width / 2 + 100, 490);
    ctx.stroke();

    // QR Code (simulasi)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(canvas.width - 140, canvas.height - 140, 60, 60);
    
    // Teks validasi
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Sertifikat ini dapat diverifikasi di sertifikat.kominfo.go.id', canvas.width / 2, canvas.height - 20);
  }
}

drawSertifikatKompetensi();
