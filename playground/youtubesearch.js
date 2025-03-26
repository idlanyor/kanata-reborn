function drawYouTubeSearch() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    // Latar belakang utama
    ctx.fillStyle = '#0F0F0F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#0F0F0F';
    ctx.fillRect(0, 0, canvas.width, 60);
    
    // Logo YouTube
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(30, 15, 30, 20);
    
    // Teks "YouTube"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('YouTube', 70, 32);
    
    // Kotak pencarian
    ctx.fillStyle = '#121212';
    ctx.fillRect(200, 10, 400, 40);
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 1;
    ctx.strokeRect(200, 10, 400, 40);
    
    // Ikon pencarian
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('🔍', 210, 35);
    
    // Placeholder teks pencarian
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Cari di YouTube', 235, 35);
    
    // Tombol pencarian
    ctx.fillStyle = '#303030';
    ctx.fillRect(600, 10, 40, 40);
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔍', 620, 35);
    
    // Sidebar navigasi
    ctx.fillStyle = '#0F0F0F';
    ctx.fillRect(0, 60, 200, canvas.height - 60);
    
    // Menu sidebar
    const menuItems = ['Beranda', 'Jelajahi', 'Subscription', 'Koleksi', 'Riwayat', 'Video Anda', 'Tonton nanti'];
    const menuIcons = ['🏠', '🔥', '📺', '📚', '⏱️', '📹', '⏰'];
    
    for (let i = 0; i < menuItems.length; i++) {
      ctx.fillStyle = i === 0 ? '#FFFFFF' : '#AAAAAA';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(menuIcons[i], 30, 100 + i * 40);
      ctx.fillText(menuItems[i], 60, 100 + i * 40);
    }
    
    // Hasil pencarian
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hasil Pencarian', 220, 90);
    
    // Video hasil pencarian
    const searchResults = [
      { title: 'Tutorial JavaScript untuk Pemula', channel: 'Coding Indonesia', views: '120K x ditonton', duration: '15:30' },
      { title: 'Belajar HTML dan CSS Dasar', channel: 'Web Dev ID', views: '85K x ditonton', duration: '22:45' },
      { title: 'Cara Membuat Website Responsive', channel: 'Programmer Zaman Now', views: '200K x ditonton', duration: '18:20' },
      { title: 'Tutorial Canvas HTML5', channel: 'Kelas Coding', views: '65K x ditonton', duration: '12:10' }
    ];
    
    let yPos = 120;
    
    searchResults.forEach((result, index) => {
      // Thumbnail video
      ctx.fillStyle = '#303030';
      ctx.fillRect(220, yPos, 160, 90);
      
      // Durasi video
      ctx.fillStyle = '#000000';
      ctx.fillRect(360 - 40, yPos + 90 - 20, 35, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.duration, 360 - 22, yPos + 90 - 7);
      
      // Judul video
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(result.title, 390, yPos + 20);
      
      // Nama channel
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(result.channel, 390, yPos + 45);
      
      // Jumlah views
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(result.views, 390, yPos + 65);
      
      yPos += 110;
    });
    
    // Filter hasil pencarian
    ctx.fillStyle = '#0F0F0F';
    ctx.fillRect(200, 60, canvas.width - 200, 30);
    
    const filters = ['Semua', 'Video', 'Channel', 'Playlist', 'Film'];
    let filterX = 220;
    
    filters.forEach((filter, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#AAAAAA';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(filter, filterX, 80);
      filterX += 80;
    });
  }
}

drawYouTubeSearch();
