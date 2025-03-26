function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    
    // Atur ukuran canvas untuk ID Card
    canvas.width = 1000;
    canvas.height = 1600;
    
    // Menggambar latar belakang dengan perpaduan warna neon
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 1)'); // Cyan
    gradient.addColorStop(1, 'rgba(255, 0, 255, 1)'); // Magenta
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tambahkan padding untuk konten dengan border radius
    ctx.fillStyle = 'rgba(12, 12, 12, 0.29)';
    ctx.beginPath();
    ctx.moveTo(40, 40 + 20); // Sudut kiri atas
    ctx.lineTo(40, canvas.height - 40 - 20); // Sisi kiri
    ctx.quadraticCurveTo(40, canvas.height - 40, 40 + 20, canvas.height - 40); // Sudut kiri bawah
    ctx.lineTo(canvas.width - 40 - 20, canvas.height - 40); // Sisi bawah
    ctx.quadraticCurveTo(canvas.width - 40, canvas.height - 40, canvas.width - 40, canvas.height - 40 - 20); // Sudut kanan bawah
    ctx.lineTo(canvas.width - 40, 40 + 20); // Sisi kanan
    ctx.quadraticCurveTo(canvas.width - 40, 40, canvas.width - 40 - 20, 40); // Sudut kanan atas
    ctx.lineTo(40 + 20, 40); // Sisi atas
    ctx.quadraticCurveTo(40, 40, 40, 40 + 20); // Sudut kiri atas
    ctx.closePath();
    ctx.fill();
    // Border hitam
    // ctx.strokeStyle = '#000000';
    // ctx.lineWidth = 15;
    // ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);
    
    // Header
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;  
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.font = 'bold 70px Impact';
    ctx.textAlign = 'center';
    ctx.fillText('ID CARD', canvas.width/2, 180);
    
    ctx.font = '36px Arial';
    ctx.fillText('NAMA ACARA', canvas.width/2, 240);
    
    // Area untuk foto profil
    const avatarSize = 350;
    ctx.beginPath();
    ctx.arc(canvas.width/2, 450, avatarSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#000000'; // Hitam untuk foto profil
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Placeholder untuk foto
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#3498db';
    ctx.fillText('A', canvas.width/2, 480);
    
    // Informasi ID Card
    ctx.fillStyle = '#ffffff';
    
    // Nama
    ctx.font = 'bold 60px Arial';
    ctx.fillText('NAMA LENGKAP', canvas.width/2, 720);
    
    // Divider
    ctx.fillRect(canvas.width/2 - 150, 740, 300, 5);
    
    // Jabatan
    ctx.font = '40px Arial';
    ctx.fillText('JABATAN', canvas.width/2, 800);
    
    // ID Number
    ctx.font = '36px Arial';
    ctx.fillText('ID: 12345678', canvas.width/2, 880);
    
    // Area untuk QR Code
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(canvas.width/2 - 125, 950, 250, 250);
    
    // Footer
    ctx.font = '30px Arial';
    ctx.fillText('Scan untuk menghubungi', canvas.width/2, 1250);
    
    // Validity
    ctx.font = 'bold 28px Arial';
    ctx.fillText('VALID THRU: SELAMANYA', canvas.width/2, 1350);
    
    // Disclaimer
    ctx.font = '24px Arial';
    ctx.fillText('Powered by Kanata', canvas.width/2, 1450);
  }
}

draw();