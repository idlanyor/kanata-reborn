import moment from 'moment';
import db from '../../database/config.js';
import schedule from 'node-schedule';

// Map untuk menyimpan job pengingat yang aktif
const reminderJobs = new Map();

// Inisialisasi tabel pengingat jika belum ada
function initReminderTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            reminder_text TEXT,
            reminder_time DATETIME,
            is_recurring BOOLEAN DEFAULT false,
            recurrence_pattern TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Fungsi untuk menjadwalkan pengingat
function scheduleReminder(reminder, sock) {
    // Batalkan job yang sudah ada jika ada
    if (reminderJobs.has(reminder.id)) {
        reminderJobs.get(reminder.id).cancel();
    }
    
    // Tentukan waktu untuk pengingat
    const reminderTime = moment(reminder.reminder_time);
    
    // Cek apakah waktunya sudah lewat
    if (reminderTime.isBefore(moment())) {
        console.log(`Pengingat #${reminder.id} sudah lewat waktunya`);
        
        // Jika pengingat berulang, jadwalkan untuk kemudian
        if (reminder.is_recurring) {
            // Implementasi logika pengingat berulang
            // ...
        } else {
            // Nonaktifkan pengingat yang sudah lewat
            db.run(`UPDATE user_reminders SET is_active = false WHERE id = ?`, [reminder.id]);
        }
        return;
    }
    
    // Jadwalkan pengingat
    const job = schedule.scheduleJob(reminderTime.toDate(), async function() {
        try {
            // Kirim pesan pengingat
            await sock.sendMessage(reminder.user_id, {
                text: `⏰ *PENGINGAT*\n\n${reminder.reminder_text}\n\n_Pengingat ini dijadwalkan untuk ${reminderTime.format('DD MMMM YYYY HH:mm')}_`
            });
            
            console.log(`Pengingat #${reminder.id} terkirim ke ${reminder.user_id}`);
            
            // Jika tidak berulang, nonaktifkan pengingat
            if (!reminder.is_recurring) {
                db.run(`UPDATE user_reminders SET is_active = false WHERE id = ?`, [reminder.id]);
                reminderJobs.delete(reminder.id);
            } else {
                // Jadwalkan ulang untuk pengingat berulang
                // ...
            }
        } catch (error) {
            console.error(`Gagal mengirim pengingat #${reminder.id}:`, error);
        }
    });
    
    reminderJobs.set(reminder.id, job);
    console.log(`Pengingat #${reminder.id} dijadwalkan untuk ${reminderTime.format('DD MMMM YYYY HH:mm')}`);
}

// Fungsi untuk memuat semua pengingat aktif
function loadActiveReminders(sock) {
    db.all(`SELECT * FROM user_reminders WHERE is_active = true`, [], (err, reminders) => {
        if (err) {
            console.error('Gagal memuat pengingat aktif:', err);
            return;
        }
        
        console.log(`Memuat ${reminders.length} pengingat aktif`);
        
        // Jadwalkan semua pengingat aktif
        reminders.forEach(reminder => {
            scheduleReminder(reminder, sock);
        });
    });
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        initReminderTable();
        const userId = m.sender;
        const subCommand = args[0]?.toLowerCase();
        
        // Muat pengingat aktif saat bot dimulai (panggil di tempat lain yang sesuai)
        // loadActiveReminders(sock);
        
        // List semua pengingat
        if (!subCommand || subCommand === 'list') {
            await m.react('⏳');
            
            db.all(`SELECT * FROM user_reminders WHERE user_id = ? ORDER BY reminder_time ASC`, 
                [userId], async (err, reminders) => {
                if (err) {
                    console.error(err);
                    await m.reply('❌ Terjadi kesalahan saat mengambil daftar pengingat');
                    return;
                }
                
                if (!reminders.length) {
                    await m.reply('📅 Anda belum memiliki pengingat. Gunakan .reminder add untuk menambahkan.');
                    return;
                }
                
                let reminderList = `📅 *DAFTAR PENGINGAT ANDA*\n\n`;
                
                reminders.forEach((rem, index) => {
                    const remTime = moment(rem.reminder_time);
                    const isActive = rem.is_active;
                    const statusEmoji = isActive ? '✅' : '❌';
                    const isPast = remTime.isBefore(moment());
                    
                    reminderList += `${index+1}. ${statusEmoji} *${rem.reminder_text}*\n`;
                    reminderList += `   ⏰ ${remTime.format('DD MMM YYYY HH:mm')}\n`;
                    
                    if (isPast && isActive) {
                        reminderList += `   ⚠️ _Sudah lewat waktu_\n`;
                    }
                    
                    if (rem.is_recurring) {
                        reminderList += `   🔄 _Pengingat berulang: ${rem.recurrence_pattern}_\n`;
                    }
                    
                    reminderList += '\n';
                });
                
                reminderList += `Gunakan ${prefix}reminder help untuk bantuan`;
                
                await m.reply(reminderList);
                await m.react('📅');
            });
            return;
        }
        
        // Tambah pengingat baru
        if (subCommand === 'add' || subCommand === 'tambah') {
            // Format: .reminder add "teks pengingat" 2023-12-31 14:30
            
            // Pisahkan teks pengingat dan waktu
            let reminderText = '';
            let timeStr = '';
            
            // Cek apakah ada teks dalam tanda kutip
            const quotedMatch = psn.match(/"([^"]+)"/);
            if (quotedMatch) {
                reminderText = quotedMatch[1].trim();
                timeStr = psn.replace(quotedMatch[0], '').replace(subCommand, '').trim();
            } else {
                // Asumsi semua yang setelah subcommand dan sebelum tanggal adalah teks
                const fullText = args.slice(1).join(' ');
                
                // Coba cari pola tanggal/waktu
                const dateMatch = fullText.match(/\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}|\d{2}\/\d{2}\/\d{4}|\d{2}:\d{2}/);
                
                if (dateMatch) {
                    const matchIndex = fullText.indexOf(dateMatch[0]);
                    reminderText = fullText.substring(0, matchIndex).trim();
                    timeStr = fullText.substring(matchIndex).trim();
                } else {
                    await m.reply(`❌ Format waktu tidak valid\nContoh: ${prefix}reminder add "Rapat tim" 2023-12-31 14:30`);
                    return;
                }
            }
            
            if (!reminderText) {
                await m.reply(`❌ Masukkan teks pengingat\nContoh: ${prefix}reminder add "Rapat tim" 2023-12-31 14:30`);
                return;
            }
            
            // Parse waktu pengingat
            const reminderTime = moment(timeStr, [
                'YYYY-MM-DD HH:mm',
                'DD-MM-YYYY HH:mm',
                'DD/MM/YYYY HH:mm',
                'YYYY-MM-DD',
                'DD-MM-YYYY',
                'DD/MM/YYYY',
                'HH:mm'
            ]);
            
            // Jika hanya waktu (tanpa tanggal), gunakan tanggal hari ini
            if (timeStr.match(/^\d{2}:\d{2}$/) && reminderTime.isValid()) {
                const today = moment();
                reminderTime.year(today.year()).month(today.month()).date(today.date());
                
                // Jika waktu sudah lewat hari ini, jadwalkan untuk besok
                if (reminderTime.isBefore(moment())) {
                    reminderTime.add(1, 'days');
                }
            }
            
            if (!reminderTime.isValid()) {
                await m.reply(`❌ Format waktu tidak valid\nContoh format: YYYY-MM-DD HH:mm atau HH:mm untuk hari ini`);
                return;
            }
            
            // Simpan pengingat ke database
            db.run(`INSERT INTO user_reminders (user_id, reminder_text, reminder_time) VALUES (?, ?, ?)`, 
                [userId, reminderText, reminderTime.format('YYYY-MM-DD HH:mm:ss')], 
                function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal menambahkan pengingat');
                        return;
                    }
                    
                    const newReminderId = this.lastID;
                    
                    // Jadwalkan pengingat
                    const reminder = {
                        id: newReminderId,
                        user_id: userId,
                        reminder_text: reminderText,
                        reminder_time: reminderTime.format('YYYY-MM-DD HH:mm:ss'),
                        is_recurring: false
                    };
                    
                    scheduleReminder(reminder, sock);
                    
                    m.reply(`✅ Pengingat berhasil ditambahkan untuk *${reminderTime.format('DD MMMM YYYY HH:mm')}*`);
                }
            );
            return;
        }
        
        // Hapus pengingat
        if (subCommand === 'delete' || subCommand === 'hapus') {
            const reminderIndex = parseInt(args[1]);
            
            if (!reminderIndex || isNaN(reminderIndex)) {
                await m.reply(`❌ Masukkan nomor pengingat yang akan dihapus\nContoh: ${prefix}reminder delete 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_reminders WHERE user_id = ? ORDER BY reminder_time ASC`, 
                [userId], async (err, reminders) => {
                if (err || !reminders.length || reminderIndex < 1 || reminderIndex > reminders.length) {
                    await m.reply('❌ Nomor pengingat tidak valid');
                    return;
                }
                
                const reminder = reminders[reminderIndex - 1];
                
                // Hapus pengingat dari database
                db.run(`DELETE FROM user_reminders WHERE id = ?`, [reminder.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal menghapus pengingat');
                        return;
                    }
                    
                    // Batalkan job pengingat jika ada
                    if (reminderJobs.has(reminder.id)) {
                        reminderJobs.get(reminder.id).cancel();
                        reminderJobs.delete(reminder.id);
                    }
                    
                    m.reply(`✅ Pengingat berhasil dihapus: *${reminder.reminder_text}*`);
                });
            });
            return;
        }
        
        // Bantuan
        if (subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `⏰ *BANTUAN PENGINGAT*\n\n` +
                    `🔹 ${prefix}reminder - Lihat daftar pengingat\n` +
                    `🔹 ${prefix}reminder add "teks" waktu - Tambah pengingat baru\n` +
                    `   Contoh: ${prefix}reminder add "Rapat tim" 2023-12-31 14:30\n` + 
                    `   Contoh: ${prefix}reminder add "Minum obat" 08:00\n` +
                    `🔹 ${prefix}reminder delete [nomor] - Hapus pengingat\n\n` +
                    `*Format Waktu:*\n` +
                    `- YYYY-MM-DD HH:mm (2023-12-31 14:30)\n` +
                    `- DD-MM-YYYY HH:mm (31-12-2023 14:30)\n` +
                    `- HH:mm (14:30) - untuk hari ini`;
            
            await m.reply(helpText);
            return;
        }
        
        // Perintah tidak dikenal
        await m.reply(`❓ Perintah tidak dikenal\nGunakan ${prefix}reminder help untuk melihat bantuan`);
        
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat mengelola pengingat');
        await m.react('❌');
    }
}; 