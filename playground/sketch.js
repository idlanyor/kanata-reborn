let results = [
    { title: 'Shape of You', artist: 'Ed Sheeran', type: 'LAGU' },
    { title: 'Billie Eilish', artist: 'Artis', type: 'ARTIS' },
    { title: 'Divide', artist: 'Ed Sheeran', type: 'ALBUM' },
    { title: 'Blinding Lights', artist: 'The Weeknd', type: 'LAGU' },
    { title: 'Taylor Swift', artist: 'Artis', type: 'ARTIS' }
  ];
  
  function setup() {
    createCanvas(900, 450);
    noLoop();
  }
  
  function draw() {
    // 🎧 Background
    noStroke();
    background('#191414');
    setGradient(0, 0, width, height, color(29, 185, 84, 15), color(25, 20, 20, 230));
  
    // 🏷️ Title
    fill('#1DB954');
    textFont('Arial');
    textAlign(CENTER);
    textSize(28);
    textStyle(BOLD);
    text('Spotify Search', width / 2, 50);
  
    // 🔍 Search Box
    fill('#333');
    rect(150, 80, 500, 40, 5);
  
    fill('#fff');
    textAlign(LEFT);
    textSize(18);
    text('🔍', 160, 105);
  
    fill('#B3B3B3');
    textSize(16);
    text('Cari artis, lagu, atau album...', 190, 105);
  
    // 🎵 Results
    let y = 150;
    fill('#fff');
    textStyle(BOLD);
    textSize(18);
    text('Hasil Teratas', 150, y);
  
    y += 30;
  
    results.forEach((r) => {
      // Card
      fill('#333');
      rect(150, y, 500, 60, 6);
  
      // Icon Box
      fill('#555');
      rect(170, y + 10, 40, 40, 4);
  
      // Icon
      fill('#1DB954');
      textAlign(CENTER);
      textSize(16);
      textStyle(BOLD);
      let icon = r.type === 'LAGU' ? '♫' : r.type === 'ARTIS' ? '👤' : '💿';
      text(icon, 190, y + 35);
  
      // Title
      textAlign(LEFT);
      fill('#fff');
      textSize(16);
      text(r.title, 230, y + 25);
  
      // Artist
      fill('#B3B3B3');
      textSize(14);
      text(r.artist, 230, y + 45);
  
      // Type
      textAlign(RIGHT);
      fill('#1DB954');
      textSize(12);
      text(r.type, 630, y + 25);
  
      y += 70;
    });
  
    // 📱 Bottom Navbar
    fill('#333');
    rect(0, height - 50, width, 50);
  
    let navIcons = ['🏠', '🔍', '📚', '❤️'];
    let navLabels = ['Beranda', 'Cari', 'Koleksi', 'Favorit'];
  
    for (let i = 0; i < navIcons.length; i++) {
      let x = (width / navIcons.length) * (i + 0.5);
      fill(i === 1 ? '#1DB954' : '#B3B3B3');
      textAlign(CENTER);
      textSize(20);
      text(navIcons[i], x, height - 25);
      textSize(12);
      text(navLabels[i], x, height - 10);
    }
  }
  
  function setGradient(x, y, w, h, c1, c2) {
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  }
  