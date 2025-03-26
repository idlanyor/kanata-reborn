function drawKartuTandaAnggotaV2() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 600;
    canvas.height = 350;

    // Latar belakang kartu dengan gradien modern
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4527a0');
    gradient.addColorStop(0.5, '#5e35b1');
    gradient.addColorStop(1, '#673ab7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pola geometris latar belakang
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
      ctx.fill();
    }

    // Border kartu dengan sudut melengkung
    ctx.strokeStyle = '#ffab00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 15);
    ctx.stroke();

    // Header kartu dengan efek bayangan
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('KARTU TANDA ANGGOTA', canvas.width / 2, 45);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Nama organisasi
    ctx.fillStyle = '#ffecb3';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('PERHIMPUNAN PROFESIONAL INDONESIA', canvas.width / 2, 75);

    // Logo organisasi (simulasi)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 110, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#ffab00';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Garis pemisah dengan gradien
    const lineGradient = ctx.createLinearGradient(30, 0, canvas.width - 30, 0);
    lineGradient.addColorStop(0, 'rgba(255, 171, 0, 0.2)');
    lineGradient.addColorStop(0.5, 'rgba(255, 171, 0, 1)');
    lineGradient.addColorStop(1, 'rgba(255, 171, 0, 0.2)');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 145);
    ctx.lineTo(canvas.width - 30, 145);
    ctx.stroke();

    // Area foto dengan efek bayangan
    ctx.fillStyle = '#f5f5f5';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(40, 165, 120, 150);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#ffab00';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 165, 120, 150);

    // Ikon foto
    ctx.fillStyle = '#9575cd';
    ctx.font = '60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👤', 100, 240);

    // Informasi anggota dengan desain modern
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('NAMA', 180, 180);
    ctx.fillText('NO. ANGGOTA', 180, 210);
    ctx.fillText('JABATAN', 180, 240);
    ctx.fillText('MASA BERLAKU', 180, 270);
    ctx.fillText('DIVISI', 180, 300);

    // Data anggota
    ctx.fillStyle = '#e1f5fe';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(': BUDI SANTOSO, S.Kom', 300, 180);
    ctx.fillText(': PPI-2024-0087654', 300, 210);
    ctx.fillText(': ANGGOTA UTAMA', 300, 240);
    ctx.fillText(': 01 JAN 2024 - 31 DES 2027', 300, 270);
    ctx.fillText(': TEKNOLOGI INFORMASI', 300, 300);

    // QR Code dengan border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(480, 165, 80, 80);
    ctx.strokeStyle = '#ffab00';
    ctx.lineWidth = 1;
    ctx.strokeRect(480, 165, 80, 80);
    
    // Teks QR Code
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN UNTUK VERIFIKASI', 520, 255);
    
    // Tanda tangan digital
    ctx.fillStyle = '#ffecb3';
    ctx.font = 'italic 12px Arial, sans-serif';
    ctx.fillText('Dr. Ir. Soekarno, M.Sc', 520, 280);
    ctx.fillText('Ketua Umum', 520, 295);
    
    // Footer dengan efek transparan
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Kartu ini dilindungi teknologi hologram dan memiliki fitur keamanan digital', canvas.width / 2, 330);
  }
}

drawKartuTandaAnggotaV2();


