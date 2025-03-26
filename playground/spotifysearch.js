function drawSpotifySearch() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    ctx.fillStyle = '#191414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(29, 185, 84, 0.05)');
    gradient.addColorStop(1, 'rgba(25, 20, 20, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1DB954';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Spotify Search', 400, 50);

    ctx.fillStyle = '#333333';
    ctx.fillRect(150, 80, 500, 40);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔍', 160, 105);
    
    ctx.fillStyle = '#B3B3B3';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Cari artis, lagu, atau album...', 190, 105);

    const results = [
      { title: 'Shape of You', artist: 'Ed Sheeran', type: 'LAGU' },
      { title: 'Billie Eilish', artist: 'Artis', type: 'ARTIS' },
      { title: 'Divide', artist: 'Ed Sheeran', type: 'ALBUM' },
      { title: 'Blinding Lights', artist: 'The Weeknd', type: 'LAGU' },
      { title: 'Taylor Swift', artist: 'Artis', type: 'ARTIS' }
    ];

    let yPos = 150;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hasil Teratas', 150, yPos);
    
    yPos += 30;

    results.forEach((result, index) => {
      ctx.fillStyle = '#333333';
      ctx.fillRect(150, yPos, 500, 60);
      
      ctx.fillStyle = '#555555';
      ctx.fillRect(170, yPos + 10, 40, 40);
      
      ctx.fillStyle = '#1DB954';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      if (result.type === 'LAGU') {
        ctx.fillText('♫', 190, yPos + 35);
      } else if (result.type === 'ARTIS') {
        ctx.fillText('👤', 190, yPos + 35);
      } else {
        ctx.fillText('💿', 190, yPos + 35);
      }
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(result.title, 230, yPos + 25);
      
      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(result.artist, 230, yPos + 45);
      
      ctx.fillStyle = '#1DB954';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(result.type, 630, yPos + 25);
      
      yPos += 70;
    });

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    const navIcons = ['🏠', '🔍', '📚', '❤️'];
    const navLabels = ['Beranda', 'Cari', 'Koleksi', 'Favorit'];
    
    for (let i = 0; i < navIcons.length; i++) {
      const x = (canvas.width / navIcons.length) * (i + 0.5);
      
      ctx.fillStyle = i === 1 ? '#1DB954' : '#B3B3B3';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(navIcons[i], x, canvas.height - 25);
      
      ctx.font = '12px Arial';
      ctx.fillText(navLabels[i], x, canvas.height - 10);
    }
  }
}

drawSpotifySearch();
