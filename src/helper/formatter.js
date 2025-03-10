export function formatPhoneNumber(phoneNumber) {
    // Hapus semua karakter non-digit
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Pastikan nomor dimulai dengan 62
    if (!cleaned.startsWith('62')) {
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        } else {
            return null;
        }
    }

    // Validasi panjang nomor (minimal 10 digit setelah kode negara)
    if (cleaned.length < 10) {
        return null;
    }

    return cleaned;
}

export function formatDate(date) {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}