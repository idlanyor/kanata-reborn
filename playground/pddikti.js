function drawPDDIKTISearch() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Mengatur ukuran canvas
    canvas.width = 800;
    canvas.height = 600;

    // Latar belakang gradien
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a237e');
    gradient.addColorStop(1, '#283593');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 PDDIKTI - Pangkalan Data Pendidikan Tinggi 🎓', canvas.width / 2, 50);

    // Panel pencarian
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 80, canvas.width - 100, 80);
    
    // Kotak pencarian
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 100, 500, 40);
    
    // Placeholder teks pencarian
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Cari nama, NIM, atau Perguruan Tinggi...', 110, 125);
    
    // Tombol pencarian
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(600, 100, 100, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cari', 650, 125);

    // Panel hasil pencarian
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 180, canvas.width - 100, canvas.height - 230);
    
    // Header tabel
    let yPos = 210;
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Nama', 80, yPos);
    ctx.fillText('NIM', 280, yPos);
    ctx.fillText('Perguruan Tinggi', 380, yPos);
    ctx.fillText('Program Studi', 580, yPos);
    
    // Garis pemisah header
    yPos += 10;
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, yPos);
    ctx.lineTo(canvas.width - 80, yPos);
    ctx.stroke();
    
    // Data hasil pencarian
    const searchResults = [
      { nama: 'Ahmad Fauzi', nim: 'SSI202203088', pt: 'Universitas Indonesia', prodi: 'Ilmu Komputer' },
      { nama: 'Siti Nurhaliza', nim: 'SSI202203045', pt: 'Institut Teknologi Bandung', prodi: 'Teknik Informatika' },
      { nama: 'Budi Santoso', nim: 'SSI202203012', pt: 'Universitas Gadjah Mada', prodi: 'Sistem Informasi' },
      { nama: 'Dewi Lestari', nim: 'SSI202203067', pt: 'Universitas Airlangga', prodi: 'Teknologi Informasi' },
      { nama: 'Rudi Hermawan', nim: 'SSI202203023', pt: 'Universitas Brawijaya', prodi: 'Ilmu Komputer' }
    ];
    
    // Menampilkan data hasil pencarian
    yPos += 30;
    
    searchResults.forEach((result, index) => {
      // Background baris (bergantian)
      if (index % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(80, yPos - 20, canvas.width - 160, 30);
      }
      
      // Nama
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(result.nama, 80, yPos);
      
      // NIM
      ctx.fillText(result.nim, 280, yPos);
      
      // Perguruan Tinggi
      ctx.fillText(result.pt, 380, yPos);
      
      // Program Studi
      ctx.fillText(result.prodi, 580, yPos);
      
      yPos += 40;
    });

    // Detail mahasiswa
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, canvas.height - 180, canvas.width - 100, 150);
    
    // Judul detail
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Detail Mahasiswa:', 80, canvas.height - 150);
    
    // Data detail
    const detailData = {
      'Nama': 'Ahmad Fauzi',
      'NIM': 'SSI202203088',
      'Perguruan Tinggi': 'Universitas Indonesia',
      'Program Studi': 'Ilmu Komputer',
      'Status': 'Aktif',
      'Semester': '4'
    };
    
    let xPos = 80;
    yPos = canvas.height - 120;
    
    Object.entries(detailData).forEach(([key, value], index) => {
      if (index === 3) {
        xPos = 400;
        yPos = canvas.height - 120;
      }
      
      // Label
      ctx.fillStyle = '#4fc3f7';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(key + ':', xPos, yPos);
      
      // Nilai
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(value, xPos + 130, yPos);
      
      yPos += 25;
    });

    // Footer
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Data dari Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kementerian Pendidikan dan Kebudayaan RI', canvas.width / 2, canvas.height - 15);
  }
}

drawPDDIKTISearch();

