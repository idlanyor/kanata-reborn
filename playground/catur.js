// Inisialisasi canvas dan konteks
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Mengatur ukuran canvas
canvas.width = 600;
canvas.height = 600;

// Ukuran papan catur
const boardSize = 8;
const squareSize = canvas.width / boardSize;

// Warna papan catur
const lightSquare = '#f0d9b5';
const darkSquare = '#b58863';

// Posisi awal bidak catur
let board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Variabel untuk menangani perpindahan bidak
let selectedPiece = null;
let selectedRow = -1;
let selectedCol = -1;
let currentPlayer = 'white'; // Pemain pertama adalah putih

// Gambar bidak catur
const pieces = {};
const pieceTypes = ['k', 'q', 'r', 'b', 'n', 'p', 'K', 'Q', 'R', 'B', 'N', 'P'];
let piecesLoaded = 0;

// Fungsi untuk menggambar papan catur
function drawBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Menentukan warna kotak
      const isLightSquare = (row + col) % 2 === 0;
      ctx.fillStyle = isLightSquare ? lightSquare : darkSquare;
      
      // Menggambar kotak
      ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      
      // Menambahkan label koordinat
      if (row === 7) {
        ctx.fillStyle = isLightSquare ? darkSquare : lightSquare;
        ctx.font = '14px Arial';
        ctx.fillText(String.fromCharCode(97 + col), (col + 0.9) * squareSize - 14, (row + 1) * squareSize - 5);
      }
      
      if (col === 0) {
        ctx.fillStyle = isLightSquare ? darkSquare : lightSquare;
        ctx.font = '14px Arial';
        ctx.fillText(8 - row, col * squareSize + 5, row * squareSize + 15);
      }
    }
  }
}

// Fungsi untuk menggambar bidak catur
function drawPieces() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col];
      if (piece !== ' ') {
        ctx.drawImage(
          pieces[piece],
          col * squareSize,
          row * squareSize,
          squareSize,
          squareSize
        );
      }
    }
  }
  
  // Highlight kotak yang dipilih
  if (selectedRow !== -1 && selectedCol !== -1) {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      selectedCol * squareSize,
      selectedRow * squareSize,
      squareSize,
      squareSize
    );
  }
}

// Fungsi untuk memuat gambar bidak
function loadPieces() {
  pieceTypes.forEach(type => {
    pieces[type] = new Image();
    pieces[type].onload = () => {
      piecesLoaded++;
      if (piecesLoaded === pieceTypes.length) {
        drawGame();
      }
    };
    
    // Menentukan URL gambar berdasarkan jenis bidak
    const color = type === type.toUpperCase() ? 'w' : 'b';
    const pieceType = type.toLowerCase();
    pieces[type].src = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${pieceType}.png`;
  });
}

// Fungsi untuk menggambar seluruh permainan
function drawGame() {
  drawBoard();
  drawPieces();
}

// Fungsi untuk memeriksa apakah langkah valid
function isValidMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const targetPiece = board[toRow][toCol];
  
  // Tidak bisa memindahkan ke kotak yang berisi bidak sendiri
  if (targetPiece !== ' ') {
    const isCurrentPlayerPiece = (currentPlayer === 'white' && targetPiece === targetPiece.toUpperCase()) ||
                                (currentPlayer === 'black' && targetPiece === targetPiece.toLowerCase());
    if (isCurrentPlayerPiece) return false;
  }
  
  // Implementasi aturan dasar untuk setiap jenis bidak
  const pieceType = piece.toLowerCase();
  
  // Pion
  if (pieceType === 'p') {
    // Aturan untuk pion putih (bergerak ke atas)
    if (piece === 'P') {
      // Langkah maju 1 kotak
      if (fromCol === toCol && toRow === fromRow - 1 && targetPiece === ' ') return true;
      // Langkah maju 2 kotak dari posisi awal
      if (fromCol === toCol && fromRow === 6 && toRow === 4 && 
          board[5][fromCol] === ' ' && targetPiece === ' ') return true;
      // Makan diagonal
      if ((toCol === fromCol - 1 || toCol === fromCol + 1) && 
          toRow === fromRow - 1 && targetPiece !== ' ' && 
          targetPiece === targetPiece.toLowerCase()) return true;
    }
    // Aturan untuk pion hitam (bergerak ke bawah)
    else {
      // Langkah maju 1 kotak
      if (fromCol === toCol && toRow === fromRow + 1 && targetPiece === ' ') return true;
      // Langkah maju 2 kotak dari posisi awal
      if (fromCol === toCol && fromRow === 1 && toRow === 3 && 
          board[2][fromCol] === ' ' && targetPiece === ' ') return true;
      // Makan diagonal
      if ((toCol === fromCol - 1 || toCol === fromCol + 1) && 
          toRow === fromRow + 1 && targetPiece !== ' ' && 
          targetPiece === targetPiece.toUpperCase()) return true;
    }
    return false;
  }
  
  // Implementasi sederhana untuk bidak lainnya
  // Dalam implementasi lengkap, perlu menambahkan aturan untuk setiap jenis bidak
  return true;
}

// Fungsi untuk menangani klik pada papan catur
function handleClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const col = Math.floor(x / squareSize);
  const row = Math.floor(y / squareSize);
  
  // Jika belum ada bidak yang dipilih
  if (selectedPiece === null) {
    const piece = board[row][col];
    if (piece !== ' ') {
      // Memeriksa apakah bidak milik pemain saat ini
      const isPieceCurrentPlayer = (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
                                  (currentPlayer === 'black' && piece === piece.toLowerCase());
      
      if (isPieceCurrentPlayer) {
        selectedPiece = piece;
        selectedRow = row;
        selectedCol = col;
        drawGame();
      }
    }
  } 
  // Jika sudah ada bidak yang dipilih
  else {
    // Jika mengklik bidak yang sama, batalkan pilihan
    if (row === selectedRow && col === selectedCol) {
      selectedPiece = null;
      selectedRow = -1;
      selectedCol = -1;
      drawGame();
      return;
    }
    
    // Coba pindahkan bidak
    if (isValidMove(selectedRow, selectedCol, row, col)) {
      // Pindahkan bidak
      board[row][col] = selectedPiece;
      board[selectedRow][selectedCol] = ' ';
      
      // Ganti giliran
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      
      // Reset pilihan
      selectedPiece = null;
      selectedRow = -1;
      selectedCol = -1;
      
      drawGame();
    }
  }
}

// Menambahkan event listener untuk klik mouse
canvas.addEventListener('click', handleClick);

// Memulai permainan
loadPieces();
