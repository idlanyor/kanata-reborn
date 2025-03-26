function drawYouTubeMusicPlayer() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(230, 30, 30, 0.3)');
    gradient.addColorStop(1, 'rgba(3, 3, 3, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const albumSize = 300;
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(30, 80, albumSize, albumSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YouTube', 30 + albumSize/2, 80 + albumSize/2 - 15);
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Music', 30 + albumSize/2, 80 + albumSize/2 + 15);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Judul Lagu Populer', 360, 120);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Nama Artis', 360, 150);
    ctx.fillText('Album • 2023', 360, 180);

    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(360, 195, 80, 24);
    ctx.fillStyle = '#030303';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('OFFICIAL', 370, 212);

    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(30, 400, canvas.width - 60, 6);
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(30, 400, (canvas.width - 60) * 0.4, 6);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1:45', 30, 425);
    
    ctx.textAlign = 'right';
    ctx.fillText('4:20', canvas.width - 30, 425);

    const controlsY = 460;
    const controlsSpacing = 60;
    const controlsCenterX = canvas.width / 2;

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⇄', controlsCenterX - controlsSpacing * 2, controlsY);

    ctx.beginPath();
    ctx.arc(controlsCenterX - controlsSpacing, controlsY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#3d3d3d';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('⏮', controlsCenterX - controlsSpacing, controlsY + 5);

    ctx.beginPath();
    ctx.arc(controlsCenterX, controlsY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#030303';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('▶', controlsCenterX + 2, controlsY + 6);

    ctx.beginPath();
    ctx.arc(controlsCenterX + controlsSpacing, controlsY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#3d3d3d';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('⏭', controlsCenterX + controlsSpacing, controlsY + 5);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '20px Arial';
    ctx.fillText('↻', controlsCenterX + controlsSpacing * 2, controlsY);

    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(canvas.width - 150, controlsY - 5, 100, 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(canvas.width - 150, controlsY - 5, 70, 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔊', canvas.width - 180, controlsY + 5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('YouTube', 30, 40);
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Music', 115, 40);
  }
}

drawYouTubeMusicPlayer();
