// Inisialisasi canvas dan konteks
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Mengatur ukuran canvas
canvas.width = 600;
canvas.height = 600;

// Ukuran papan ular tangga
const boardSize = 10; // 10x10 papan
const squareSize = canvas.width / boardSize;

// Warna papan
const lightSquare = '#f0f0f0';
const darkSquare = '#e0e0e0';
const borderColor = '#333333';

// Posisi pemain
let playerPositions = [1, 1]; // Posisi pemain 1 dan pemain 2
let currentPlayer = 0; // 0 untuk pemain pertama, 1 untuk pemain kedua

// Definisi ular dan tangga
const snakesAndLadders = {
  // Tangga (dari, ke)
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  63: 81,
  71: 91,
  
  // Ular (dari, ke)
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78
};

// Gambar dadu
let diceValue = 1;
let isRolling = false;
let gameOver = false;

// Fungsi untuk menggambar papan ular tangga
function drawBoard() {
  // Menggambar latar belakang papan
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Menggambar kotak-kotak papan
  let number = boardSize * boardSize;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Menentukan posisi kotak
      let x, y;
      
      // Menentukan arah baris (zigzag)
      if (row % 2 === 0) {
        // Baris genap: kiri ke kanan
        x = col * squareSize;
      } else {
        // Baris ganjil: kanan ke kiri
        x = (boardSize - 1 - col) * squareSize;
      }
      
      y = (boardSize - 1 - row) * squareSize;
      
      // Menentukan warna kotak
      const isLightSquare = (row + col) % 2 === 0;
      ctx.fillStyle = isLightSquare ? lightSquare : darkSquare;
      
      // Menggambar kotak
      ctx.fillRect(x, y, squareSize, squareSize);
      
      // Menggambar border kotak
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, squareSize, squareSize);
      
      // Menggambar nomor kotak
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Menentukan nomor kotak berdasarkan posisi zigzag
      let squareNumber;
      if (row % 2 === 0) {
        // Baris genap: kiri ke kanan
        squareNumber = boardSize * boardSize - (row * boardSize + (boardSize - col - 1));
      } else {
        // Baris ganjil: kanan ke kiri
        squareNumber = boardSize * boardSize - (row * boardSize + col);
      }
      
      ctx.fillText(squareNumber.toString(), x + squareSize / 2, y + squareSize / 2);
    }
  }
  
  // Menggambar ular dan tangga
  drawSnakesAndLadders();
  
  // Menggambar pemain
  drawPlayers();
  
  // Menggambar dadu
  drawDice();
  
  // Menggambar informasi pemain
  drawPlayerInfo();
}

// Fungsi untuk menggambar ular dan tangga
function drawSnakesAndLadders() {
  ctx.lineWidth = 8;
  
  for (const start in snakesAndLadders) {
    const end = snakesAndLadders[start];
    
    // Mendapatkan koordinat kotak awal dan akhir
    const startCoord = getCoordinates(parseInt(start));
    const endCoord = getCoordinates(end);
    
    // Menentukan apakah ini ular atau tangga
    if (parseInt(start) < end) {
      // Ini adalah tangga
      ctx.strokeStyle = '#4CAF50'; // Warna hijau untuk tangga
    } else {
      // Ini adalah ular
      ctx.strokeStyle = '#F44336'; // Warna merah untuk ular
    }
    
    // Menggambar garis
    ctx.beginPath();
    ctx.moveTo(startCoord.x + squareSize / 2, startCoord.y + squareSize / 2);
    ctx.lineTo(endCoord.x + squareSize / 2, endCoord.y + squareSize / 2);
    ctx.stroke();
    
    // Menggambar lingkaran di ujung garis
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(startCoord.x + squareSize / 2, startCoord.y + squareSize / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(endCoord.x + squareSize / 2, endCoord.y + squareSize / 2, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Fungsi untuk mendapatkan koordinat kotak berdasarkan nomor
function getCoordinates(number) {
  const row = boardSize - Math.ceil(number / boardSize);
  let col;
  
  if (Math.ceil(number / boardSize) % 2 === 1) {
    // Baris ganjil: kiri ke kanan
    col = (number - 1) % boardSize;
  } else {
    // Baris genap: kanan ke kiri
    col = boardSize - 1 - ((number - 1) % boardSize);
  }
  
  return {
    x: col * squareSize,
    y: row * squareSize
  };
}

// Fungsi untuk menggambar pemain
function drawPlayers() {
  const playerColors = ['#2196F3', '#FF9800']; // Biru untuk pemain 1, oranye untuk pemain 2
  
  for (let i = 0; i < playerPositions.length; i++) {
    const position = playerPositions[i];
    const coord = getCoordinates(position);
    
    // Menggambar lingkaran pemain
    ctx.fillStyle = playerColors[i];
    ctx.beginPath();
    
    // Menggeser posisi pemain agar tidak tumpang tindih
    let offsetX = i === 0 ? -15 : 15;
    
    ctx.arc(coord.x + squareSize / 2 + offsetX, coord.y + squareSize / 2, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Menambahkan border pada lingkaran pemain
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Menambahkan nomor pemain
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((i + 1).toString(), coord.x + squareSize / 2 + offsetX, coord.y + squareSize / 2);
  }
}

// Fungsi untuk menggambar dadu
function drawDice() {
  // Menggambar kotak dadu
  const diceX = canvas.width - 100;
  const diceY = canvas.height - 100;
  const diceSize = 60;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(diceX, diceY, diceSize, diceSize);
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(diceX, diceY, diceSize, diceSize);
  
  // Menggambar titik-titik dadu
  ctx.fillStyle = '#333333';
  
  const dotSize = 8;
  const padding = 10;
  
  // Posisi titik-titik berdasarkan nilai dadu
  switch (diceValue) {
    case 1:
      // Titik tengah
      ctx.beginPath();
      ctx.arc(diceX + diceSize / 2, diceY + diceSize / 2, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 2:
      // Titik kiri atas dan kanan bawah
      ctx.beginPath();
      ctx.arc(diceX + padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 3:
      // Titik kiri atas, tengah, dan kanan bawah
      ctx.beginPath();
      ctx.arc(diceX + padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize / 2, diceY + diceSize / 2, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 4:
      // Titik di empat sudut
      ctx.beginPath();
      ctx.arc(diceX + padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 5:
      // Titik di empat sudut dan tengah
      ctx.beginPath();
      ctx.arc(diceX + padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize / 2, diceY + diceSize / 2, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 6:
      // Titik di enam posisi
      ctx.beginPath();
      ctx.arc(diceX + padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + padding, diceY + diceSize / 2, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize / 2, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.arc(diceX + diceSize - padding, diceY + diceSize - padding, dotSize, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

// Fungsi untuk menggambar informasi pemain
function drawPlayerInfo() {
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Informasi pemain 1
  ctx.fillStyle = '#2196F3';
  ctx.fillText('Pemain 1: ' + playerPositions[0], 20, canvas.height - 80);
  
  // Informasi pemain 2
  ctx.fillStyle = '#FF9800';
  ctx.fillText('Pemain 2: ' + playerPositions[1], 20, canvas.height - 50);
  
  // Informasi giliran
  ctx.fillStyle = '#333333';
  ctx.fillText('Giliran: Pemain ' + (currentPlayer + 1), 20, canvas.height - 110);
  
  // Tombol lempar dadu
  drawButton('Lempar Dadu', canvas.width - 150, canvas.height - 150, 120, 40);
  
  // Pesan jika permainan berakhir
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pemain ' + (currentPlayer === 0 ? 2 : 1) + ' Menang!', canvas.width / 2, canvas.height / 2);
    
    // Tombol main lagi
    drawButton('Main Lagi', canvas.width / 2 - 60, canvas.height / 2 + 50, 120, 40);
  }
}

// Fungsi untuk menggambar tombol
function drawButton(text, x, y, width, height) {
  // Latar belakang tombol
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x, y, width, height);
  
  // Border tombol
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  
  // Teks tombol
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
}

// Fungsi untuk mengocok dadu
function rollDice() {
  if (isRolling || gameOver) return;
  
  isRolling = true;
  let rollCount = 0;
  const maxRolls = 10;
  
  const rollInterval = setInterval(() => {
    diceValue = Math.floor(Math.random() * 6) + 1;
    drawBoard();
    
    rollCount++;
    if (rollCount >= maxRolls) {
      clearInterval(rollInterval);
      isRolling = false;
      movePlayer();
    }
  }, 100);
}

// Fungsi untuk memindahkan pemain
function movePlayer() {
  // Memindahkan pemain sesuai nilai dadu
  playerPositions[currentPlayer] += diceValue;
  
  // Memeriksa apakah pemain melebihi batas papan
  if (playerPositions[currentPlayer] > boardSize * boardSize) {
    playerPositions[currentPlayer] = boardSize * boardSize - (playerPositions[currentPlayer] - boardSize * boardSize);
  }
  
  // Memeriksa apakah pemain berada di ular atau tangga
  if (snakesAndLadders[playerPositions[currentPlayer]]) {
    playerPositions[currentPlayer] = snakesAndLadders[playerPositions[currentPlayer]];
  }
  
  // Memeriksa apakah pemain mencapai kotak terakhir
  if (playerPositions[currentPlayer] === boardSize * boardSize) {
    gameOver = true;
  }
  
  // Mengganti giliran
  if (!gameOver) {
    currentPlayer = (currentPlayer + 1) % 2;
  }
  
  // Menggambar ulang papan
  drawBoard();
}

// Fungsi untuk menangani klik mouse
function handleClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Memeriksa apakah tombol lempar dadu diklik
  if (x >= canvas.width - 150 && x <= canvas.width - 30 &&
      y >= canvas.height - 150 && y <= canvas.height - 110) {
    rollDice();
  }
  
  // Memeriksa apakah tombol main lagi diklik
  if (gameOver && 
      x >= canvas.width / 2 - 60 && x <= canvas.width / 2 + 60 &&
      y >= canvas.height / 2 + 50 && y <= canvas.height / 2 + 90) {
    resetGame();
  }
}

// Fungsi untuk mengatur ulang permainan
function resetGame() {
  playerPositions = [1, 1];
  currentPlayer = 0;
  diceValue = 1;
  isRolling = false;
  gameOver = false;
  drawBoard();
}

// Menambahkan event listener untuk klik mouse
canvas.addEventListener('click', handleClick);

// Memulai permainan
drawBoard();
