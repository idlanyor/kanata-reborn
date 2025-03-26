function drawInvoice() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // Atur ukuran canvas untuk struk
    canvas.width = 800;
    canvas.height = 1000;

    // Menggambar latar belakang dengan gradien lembut
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(249, 249, 249, 1)');
    gradient.addColorStop(1, 'rgb(255, 255, 255)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    // Header dengan styling yang lebih menarik
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRUK PENJUALAN', canvas.width / 2, 40);
    
    // Logo toko (simulasi dengan lingkaran berwarna)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 80, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#4a90e2';
    ctx.fill();
    
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#333333';
    ctx.fillText('WISESA CELL', canvas.width / 2, 130);
    
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('Karangreja, RT 02 RW 02 Purbalingga', canvas.width / 2, 155);
    ctx.fillText('Telp: 0812-3456-7890', canvas.width / 2, 175);

    // Informasi Pembeli dengan styling yang lebih baik
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('Informasi Pembeli:', 40, 220);
    
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('Nama   : John Doe', 40, 245);
    ctx.fillText('Alamat : Jl. Contoh No. 123', 40, 270);
    
    ctx.textAlign = 'right';
    ctx.fillText('Tanggal : ' + new Date().toLocaleDateString('id-ID'), canvas.width - 40, 245);
    ctx.fillText('Nomor Order : 123456', canvas.width - 40, 270);

    // Garis pemisah dengan styling yang lebih menarik
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(20, 300);
    ctx.lineTo(canvas.width - 20, 300);
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Header tabel dengan background
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(20, 320, canvas.width - 40, 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('Nama Barang', 40, 340);
    ctx.textAlign = 'center';
    ctx.fillText('Jumlah', canvas.width - 150, 340);
    ctx.textAlign = 'right';
    ctx.fillText('Harga', canvas.width - 40, 340);

    // Data Invoice dengan baris bergantian warna
    const items = [
      { description: 'Pulsa 10.000', quantity: 1, price: 10000 },
      { description: 'Pulsa 20.000', quantity: 2, price: 20000 },
      { description: 'Voucher Game', quantity: 3, price: 15000 },
      { description: 'Pulsa 50.000', quantity: 1, price: 50000 },
      { description: 'Pulsa 100.000', quantity: 1, price: 100000 }
    ];

    let total = 0;
    let yPosition = 370;

    items.forEach((item, index) => {
      // Baris bergantian warna
      if (index % 2 === 0) {
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(20, yPosition - 20, canvas.width - 40, 30);
      }
      
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'left';
      ctx.fillText(item.description, 40, yPosition);
      
      ctx.textAlign = 'center';
      ctx.fillText(item.quantity.toString(), canvas.width - 150, yPosition);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Rp ${item.price.toLocaleString('id-ID')}`, canvas.width - 40, yPosition);
      
      total += item.price * item.quantity;
      yPosition += 30;
    });

    // Total dengan styling yang lebih menarik
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(20, yPosition);
    ctx.lineTo(canvas.width - 20, yPosition);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Total', 40, yPosition + 30);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${total.toLocaleString('id-ID')}`, canvas.width - 40, yPosition + 30);

    // Tambahkan QR Code (simulasi)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(canvas.width / 2 - 50, yPosition + 60, 100, 100);
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(canvas.width / 2 - 50, yPosition + 60, 100, 100);
    
    // Tambahkan teks di dalam QR Code
    ctx.fillStyle = '#333333';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Scan Me', canvas.width / 2, yPosition + 115);

    // Footer dengan styling yang lebih menarik
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('Terima kasih atas pembelian Anda!', canvas.width / 2, yPosition + 200);
    ctx.fillText('Silakan simpan struk ini sebagai bukti pembayaran.', canvas.width / 2, yPosition + 225);
    
   }
}

drawInvoice();
