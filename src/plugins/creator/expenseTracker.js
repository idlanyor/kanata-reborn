import { createCanvas } from 'canvas';
import moment from 'moment';
import db from '../../database/config.js';

// Inisialisasi tabel keuangan
function initExpenseTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            amount DECIMAL(10,2),
            type TEXT CHECK(type IN ('income', 'expense')),
            category TEXT,
            description TEXT,
            date DATE DEFAULT CURRENT_DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Fungsi untuk membuat visual laporan keuangan
async function createExpenseReport(expenses, title) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    
    // Background dengan gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2C3E50');
    gradient.addColorStop(1, '#3498DB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.font = '60px Poppins Bold';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width/2, 80);
    
    // Garis pemisah
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(canvas.width - 100, 120);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Ringkasan
    const totalIncome = expenses
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    
    ctx.textAlign = 'left';
    ctx.font = '35px Poppins';
    
    // Total Pemasukan
    ctx.fillStyle = '#2ECC71';
    ctx.fillText('Total Pemasukan:', 150, 180);
    ctx.fillText(`Rp ${totalIncome.toLocaleString()}`, 150, 220);
    
    // Total Pengeluaran
    ctx.fillStyle = '#E74C3C';
    ctx.fillText('Total Pengeluaran:', 600, 180);
    ctx.fillText(`Rp ${totalExpense.toLocaleString()}`, 600, 220);
    
    // Saldo
    ctx.fillStyle = '#F1C40F';
    ctx.fillText('Saldo:', 150, 280);
    ctx.fillText(`Rp ${balance.toLocaleString()}`, 150, 320);
    
    // Daftar Transaksi
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Poppins Bold';
    ctx.fillText('Transaksi Terakhir:', 150, 400);
    
    let yPos = 450;
    const lastTransactions = expenses.slice(-5);
    
    for (const tx of lastTransactions) {
        const isIncome = tx.type === 'income';
        ctx.fillStyle = isIncome ? '#2ECC71' : '#E74C3C';
        
        const icon = isIncome ? '📈' : '📉';
        const amount = `Rp ${tx.amount.toLocaleString()}`;
        const date = moment(tx.date).format('DD/MM/YYYY');
        
        ctx.font = '25px Poppins';
        ctx.fillText(`${icon} ${amount} - ${tx.category}`, 150, yPos);
        ctx.font = '20px Poppins';
        ctx.fillText(`${date} | ${tx.description}`, 150, yPos + 30);
        
        yPos += 70;
    }
    
    return canvas.toBuffer();
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        initExpenseTable();
        const userId = m.sender;
        const subCommand = args[0]?.toLowerCase();
        
        // Bantuan
        if (!subCommand || subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `💰 *BANTUAN EXPENSE TRACKER*\n\n` +
                    `🔹 ${prefix}uang - Lihat laporan keuangan\n` +
                    `🔹 ${prefix}uang masuk <nominal> <kategori> <deskripsi> - Catat pemasukan\n` +
                    `🔹 ${prefix}uang keluar <nominal> <kategori> <deskripsi> - Catat pengeluaran\n` +
                    `🔹 ${prefix}uang laporan <hari/bulan> - Lihat laporan periode tertentu\n` +
                    `🔹 ${prefix}uang kategori - Lihat daftar kategori\n\n` +
                    `Contoh:\n` +
                    `${prefix}uang masuk 500000 Gaji Gaji bulanan\n` +
                    `${prefix}uang keluar 50000 Makan Makan siang\n` +
                    `${prefix}uang laporan bulan`;
            
            await m.reply(helpText);
            return;
        }
        
        // Catat pemasukan
        if (subCommand === 'masuk' || subCommand === 'in') {
            if (args.length < 4) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}uang masuk 500000 Gaji Gaji bulanan`);
                return;
            }
            
            const amount = parseFloat(args[1].replace(/[.,]/g, ''));
            if (isNaN(amount) || amount <= 0) {
                await m.reply('❌ Nominal tidak valid');
                return;
            }
            
            const category = args[2];
            const description = args.slice(3).join(' ');
            
            db.run(`INSERT INTO user_expenses (user_id, amount, type, category, description) 
                   VALUES (?, ?, 'income', ?, ?)`,
                [userId, amount, category, description],
                async function(err) {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mencatat pemasukan');
                        return;
                    }
                    
                    await m.reply(`✅ Pemasukan berhasil dicatat:\n` +
                                `💰 Rp ${amount.toLocaleString()}\n` +
                                `📋 Kategori: ${category}\n` +
                                `📝 Deskripsi: ${description}`);
                }
            );
            return;
        }
        
        // Catat pengeluaran
        if (subCommand === 'keluar' || subCommand === 'out') {
            if (args.length < 4) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}uang keluar 50000 Makan Makan siang`);
                return;
            }
            
            const amount = parseFloat(args[1].replace(/[.,]/g, ''));
            if (isNaN(amount) || amount <= 0) {
                await m.reply('❌ Nominal tidak valid');
                return;
            }
            
            const category = args[2];
            const description = args.slice(3).join(' ');
            
            db.run(`INSERT INTO user_expenses (user_id, amount, type, category, description) 
                   VALUES (?, ?, 'expense', ?, ?)`,
                [userId, amount, category, description],
                async function(err) {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mencatat pengeluaran');
                        return;
                    }
                    
                    await m.reply(`✅ Pengeluaran berhasil dicatat:\n` +
                                `💰 Rp ${amount.toLocaleString()}\n` +
                                `📋 Kategori: ${category}\n` +
                                `📝 Deskripsi: ${description}`);
                }
            );
            return;
        }
        
        // Lihat laporan
        if (subCommand === 'laporan' || subCommand === 'report') {
            const period = args[1]?.toLowerCase();
            let startDate, title;
            
            if (period === 'hari' || period === 'day') {
                startDate = moment().startOf('day').format('YYYY-MM-DD');
                title = 'LAPORAN HARI INI';
            } else if (period === 'bulan' || period === 'month') {
                startDate = moment().startOf('month').format('YYYY-MM-DD');
                title = 'LAPORAN BULAN INI';
            } else {
                startDate = moment().startOf('month').format('YYYY-MM-DD');
                title = 'LAPORAN BULAN INI';
            }
            
            db.all(`SELECT * FROM user_expenses 
                   WHERE user_id = ? AND date >= ? 
                   ORDER BY date DESC, created_at DESC`,
                [userId, startDate],
                async (err, expenses) => {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mengambil laporan');
                        return;
                    }
                    
                    if (expenses.length === 0) {
                        await m.reply('📝 Belum ada transaksi untuk periode ini');
                        return;
                    }
                    
                    const reportImage = await createExpenseReport(expenses, title);
                    
                    await sock.sendMessage(id, {
                        image: reportImage,
                        caption: `💰 *${title}*\n\n` +
                                `📊 Total transaksi: ${expenses.length}\n` +
                                `📅 Periode: ${moment(startDate).format('DD MMMM YYYY')}`
                    }, { quoted: m });
                }
            );
            return;
        }
        
        // Lihat kategori
        if (subCommand === 'kategori' || subCommand === 'category') {
            db.all(`SELECT type, category, COUNT(*) as count, SUM(amount) as total 
                   FROM user_expenses 
                   WHERE user_id = ? 
                   GROUP BY type, category 
                   ORDER BY type DESC, total DESC`,
                [userId],
                async (err, categories) => {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mengambil daftar kategori');
                        return;
                    }
                    
                    if (categories.length === 0) {
                        await m.reply('📝 Belum ada kategori yang tercatat');
                        return;
                    }
                    
                    let categoryList = `📋 *DAFTAR KATEGORI*\n\n`;
                    categoryList += `📈 *PEMASUKAN*\n`;
                    
                    categories
                        .filter(c => c.type === 'income')
                        .forEach(c => {
                            categoryList += `├ ${c.category}\n`;
                            categoryList += `│ Total: Rp ${c.total.toLocaleString()}\n`;
                            categoryList += `│ Jumlah: ${c.count}x\n`;
                        });
                    
                    categoryList += `\n📉 *PENGELUARAN*\n`;
                    categories
                        .filter(c => c.type === 'expense')
                        .forEach(c => {
                            categoryList += `├ ${c.category}\n`;
                            categoryList += `│ Total: Rp ${c.total.toLocaleString()}\n`;
                            categoryList += `│ Jumlah: ${c.count}x\n`;
                        });
                    
                    await m.reply(categoryList);
                }
            );
            return;
        }
        
        // Default: tampilkan laporan bulan ini
        args[0] = 'laporan';
        args[1] = 'bulan';
        await this({ sock, m, id, psn, args, cmd, prefix });
        
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat mengelola keuangan');
        await m.react('❌');
    }
}; 