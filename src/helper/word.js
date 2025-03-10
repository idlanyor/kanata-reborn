function maskWord(word) {
    if (word.length <= 1) return word; // Jika panjang kata hanya 1 atau kurang, kembalikan kata tersebut.
    let masked = word[0]; // Ambil karakter pertama
    for (let i = 1; i < word.length; i++) {
        masked += '-'; // Tambahkan '*' untuk setiap karakter selain yang pertama
    }
    return masked;
}

export function maskSentence(sentence) {
    let words = sentence.split(' '); // Pisahkan kalimat menjadi kata-kata
    let maskedWords = words.map(maskWord); // Masking setiap kata
    return maskedWords.join(' '); // Gabungkan kembali menjadi kalimat
}
