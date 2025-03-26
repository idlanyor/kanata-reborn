function drawSpotifyPlayer() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    ctx.fillStyle = '#191414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#191414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(29, 185, 84, 0.05)'); // Hijau Spotify dengan transparansi
    gradient.addColorStop(1, 'rgba(25, 20, 20, 0.9)');   // Hitam Spotify dengan sedikit transparansi
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1DB954';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kanata Spotify Player', 400, 50);

    const albumSize = 250;
    ctx.fillStyle = '#333333';
    ctx.fillRect(30, 80, albumSize, albumSize);

    ctx.fillStyle = '#1DB954';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('♫', 30 + albumSize/2, 80 + albumSize/2);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Judul Lagu', 320, 120);

    ctx.fillStyle = '#B3B3B3';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Nama Artis', 320, 150);
    ctx.fillText('Album • 2023', 320, 180);

    ctx.fillStyle = '#333333';
    ctx.fillRect(30, 360, canvas.width - 60, 10);
    
    ctx.fillStyle = '#1DB954';
    ctx.fillRect(30, 360, (canvas.width - 60) * 0.4, 10);

    ctx.fillStyle = '#B3B3B3';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1:45', 30, 390);
    
    ctx.textAlign = 'right';
    ctx.fillText('4:20', canvas.width - 30, 390);

    const controlsY = 430;
    const controlsSpacing = 80;
    const controlsCenterX = canvas.width / 2;

    ctx.beginPath();
    ctx.arc(controlsCenterX - controlsSpacing, controlsY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏮', controlsCenterX - controlsSpacing, controlsY + 5);

    ctx.beginPath();
    ctx.arc(controlsCenterX, controlsY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#1DB954';
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('▶', controlsCenterX + 2, controlsY + 6);

    ctx.beginPath();
    ctx.arc(controlsCenterX + controlsSpacing, controlsY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('⏭', controlsCenterX + controlsSpacing, controlsY + 5);

    ctx.fillStyle = '#333333';
    ctx.fillRect(canvas.width - 150, controlsY - 5, 100, 10);
    
    ctx.fillStyle = '#1DB954';
    ctx.fillRect(canvas.width - 150, controlsY - 5, 70, 10);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔊', canvas.width - 180, controlsY + 5);
  }
}

drawSpotifyPlayer();
