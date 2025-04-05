import { scheduleJob, cancelJob } from 'node-schedule';
import moment from 'moment';
import db from '../../database/config.js';

// Inisialisasi tabel reminder
function initReminderTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            reminder_text TEXT,
            reminder_time DATETIME,
            is_recurring BOOLEAN DEFAULT false,
            recurrence_pattern TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Map untuk menyimpan job yang sedang berjalan
const activeJobs = new Map();

// Fungsi untuk menjadwalkan reminder
function scheduleReminder(sock, userId, reminderId, reminderText, reminderTime) {
    const job = scheduleJob(reminderTime, async () => {
        try {
            await sock.sendMessage(userId, {
                text: `🔔 *PENGINGAT*\n\n${reminderText}\n\nWaktu: ${moment(reminderTime).format('DD MMMM YYYY HH:mm')}`
            });
            
            // Hapus reminder yang sudah selesai (jika tidak berulang)
            db.run(`DELETE FROM user_reminders WHERE id = ? AND is_recurring = false`, [reminderId]);
            activeJobs.delete(reminderId);
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    });
    
    activeJobs.set(reminderId, job);
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        initReminderTable();
        const userId = m.sender;
        const subCommand = args[0]?.toLowerCase();
        
        // Tampilkan daftar reminder
        if (!subCommand || subCommand === 'list') {
            await m.react('⏳');
            
            db.all(`SELECT * FROM user_reminders WHERE user_id = ? ORDER BY reminder_time ASC`, 
                [userId], async (err, reminders) => {
                if (err) {
                    console.error(err);
                    await m.reply('❌ Terjadi kesalahan saat mengambil daftar pengingat');
                    return;
                }
                
                if (reminders.length === 0) {
                    await m.reply('📝 Tidak ada pengingat yang aktif');
                    return;
                }
                
                let reminderList = `📋 *DAFTAR PENGINGAT*\n\n`;
                reminders.forEach((reminder, index) => {
                    reminderList += `${index + 1}. ${reminder.reminder_text}\n`;
                    reminderList += `⏰ ${moment(reminder.reminder_time).format('DD MMMM YYYY HH:mm')}\n`;
                    if (reminder.is_recurring) {
                        reminderList += `🔄 Berulang: ${reminder.recurrence_pattern}\n`;
                    }
                    reminderList += `\n`;
                });
                
                await m.reply(reminderList);
                await m.react('📋');
            });
            return;
        }
        
        // Tambah reminder baru
        if (subCommand === 'add' || subCommand === 'tambah') {
            // Format: .reminder add <waktu> <pesan>
            // Contoh: .reminder add 2023-12-31 14:30 Rapat tim
            
            if (args.length < 4) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}reminder add 2023-12-31 14:30 Rapat tim`);
                return;
            }
            
            const dateStr = args[1];
            const timeStr = args[2];
            const reminderText = args.slice(3).join(' ');
            
            const reminderTime = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
            
            if (!reminderTime.isValid()) {
                await m.reply('❌ Format waktu tidak valid\nGunakan format: YYYY-MM-DD HH:mm');
                return;
            }
            
            if (reminderTime.isBefore(moment())) {
                await m.reply('❌ Waktu pengingat tidak boleh di masa lalu');
                return;
            }
            
            db.run(`INSERT INTO user_reminders (user_id, reminder_text, reminder_time) VALUES (?, ?, ?)`,
                [userId, reminderText, reminderTime.format('YYYY-MM-DD HH:mm:ss')],
                function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal menambahkan pengingat');
                        return;
                    }
                    
                    // Jadwalkan reminder
                    scheduleReminder(sock, id, this.lastID, reminderText, reminderTime.toDate());
                    
                    m.reply(`✅ Pengingat berhasil ditambahkan:\n` +
                           `📝 ${reminderText}\n` +
                           `⏰ ${reminderTime.format('DD MMMM YYYY HH:mm')}`);
                }
            );
            return;
        }
        
        // Hapus reminder
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
                
                // Batalkan job yang sedang berjalan
                const job = activeJobs.get(reminder.id);
                if (job) {
                    job.cancel();
                    activeJobs.delete(reminder.id);
                }
                
                db.run(`DELETE FROM user_reminders WHERE id = ?`, [reminder.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal menghapus pengingat');
                        return;
                    }
                    
                    m.reply(`✅ Pengingat berhasil dihapus:\n` +
                           `📝 ${reminder.reminder_text}\n` +
                           `⏰ ${moment(reminder.reminder_time).format('DD MMMM YYYY HH:mm')}`);
                });
            });
            return;
        }
        
        // Bantuan
        if (subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `📋 *BANTUAN REMINDER*\n\n` +
                    `🔹 ${prefix}reminder - Lihat daftar pengingat\n` +
                    `🔹 ${prefix}reminder add <YYYY-MM-DD> <HH:mm> <pesan> - Tambah pengingat baru\n` +
                    `🔹 ${prefix}reminder delete <nomor> - Hapus pengingat\n\n` +
                    `Contoh:\n` +
                    `${prefix}reminder add 2023-12-31 14:30 Rapat tim`;
            
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