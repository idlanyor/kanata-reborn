import { createCanvas, loadImage } from 'canvas';
import moment from 'moment';
import db from '../../database/config.js';

// Fungsi untuk membuat visual task list
async function createTaskVisual(userId, tasks) {
    // Ukuran canvas
    const canvas = createCanvas(1200, 1600);
    const ctx = canvas.getContext('2d');
    
    // Background dengan gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2C3E50');
    gradient.addColorStop(1, '#4CA1AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.font = '70px Poppins Bold';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('DAFTAR TUGAS ANDA', canvas.width/2, 100);
    
    // Tanggal hari ini
    ctx.font = '40px Poppins';
    ctx.fillText(moment().format('dddd, DD MMMM YYYY'), canvas.width/2, 170);
    
    // Garis pemisah
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(canvas.width - 100, 220);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Daftar tugas
    let yPosition = 300;
    
    if (tasks.length === 0) {
        ctx.font = '40px Poppins Italic';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Tidak ada tugas tersimpan', canvas.width/2, yPosition);
    } else {
        ctx.textAlign = 'left';
        ctx.font = '35px Poppins Bold';
        ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskStatus = task.is_completed ? '✅' : '⬜';
            
            // Task box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(100, yPosition - 40, canvas.width - 200, 100);
            
            // Prioritas marker
            let priorityColor;
            switch(task.priority) {
                case 'high': priorityColor = '#FF5252'; break;
                case 'medium': priorityColor = '#FFC107'; break;
                default: priorityColor = '#4CAF50'; break;
            }
            
            ctx.fillStyle = priorityColor;
            ctx.fillRect(100, yPosition - 40, 15, 100);
            
            // Task text
            ctx.fillStyle = '#ffffff';
            ctx.font = '35px Poppins Bold';
            ctx.fillText(`${i+1}. ${taskStatus} ${task.title}`, 130, yPosition);
            
            // Due date jika ada
            if (task.due_date) {
                const dueDate = moment(task.due_date);
                const isOverdue = dueDate.isBefore(moment()) && !task.is_completed;
                
                ctx.font = '25px Poppins';
                ctx.fillStyle = isOverdue ? '#FF5252' : 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(`Deadline: ${dueDate.format('DD MMM YYYY')}`, 130, yPosition + 35);
            }
            
            yPosition += 120;
        }
    }
    
    // Footer
    ctx.font = '25px Poppins';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('Gunakan .task add [judul] untuk menambah tugas baru', canvas.width/2, canvas.height - 100);
    ctx.fillText('Gunakan .task done [nomor] untuk menandai tugas selesai', canvas.width/2, canvas.height - 60);
    
    return canvas.toBuffer();
}

// Inisialisasi tabel tugas jika belum ada
function initTaskTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            title TEXT,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            is_completed BOOLEAN DEFAULT false,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        initTaskTable();
        const userId = m.sender;
        const subCommand = args[0]?.toLowerCase();
        
        // Tampilkan daftar tugas
        if (!subCommand || subCommand === 'list') {
            await m.react('⏳');
            
            db.all(`SELECT * FROM user_tasks WHERE user_id = ? ORDER BY is_completed, priority = 'high' DESC, due_date ASC`, 
                [userId], async (err, tasks) => {
                if (err) {
                    console.error(err);
                    await m.reply('❌ Terjadi kesalahan saat mengambil daftar tugas');
                    return;
                }
                
                const taskImage = await createTaskVisual(userId, tasks);
                
                await sock.sendMessage(id, {
                    image: taskImage,
                    caption: `📋 *DAFTAR TUGAS*\n\n` +
                            `📊 Total: ${tasks.length} tugas\n` +
                            `✅ Selesai: ${tasks.filter(t => t.is_completed).length} tugas\n` +
                            `⬜ Belum selesai: ${tasks.filter(t => !t.is_completed).length} tugas\n\n` +
                            `Gunakan ${prefix}task help untuk melihat bantuan`
                }, { quoted: m });
                
                await m.react('📋');
            });
            return;
        }
        
        // Tambah tugas baru
        if (subCommand === 'add' || subCommand === 'tambah') {
            const taskTitle = args.slice(1).join(' ');
            
            if (!taskTitle) {
                await m.reply(`❌ Masukkan judul tugas\nContoh: ${prefix}task add Menyelesaikan laporan`);
                return;
            }
            
            db.run(`INSERT INTO user_tasks (user_id, title) VALUES (?, ?)`, 
                [userId, taskTitle], function(err) {
                if (err) {
                    console.error(err);
                    m.reply('❌ Gagal menambahkan tugas');
                    return;
                }
                
                m.reply(`✅ Tugas berhasil ditambahkan: *${taskTitle}*`);
            });
            return;
        }
        
        // Tandai tugas selesai
        if (subCommand === 'done' || subCommand === 'selesai') {
            const taskIndex = parseInt(args[1]);
            
            if (!taskIndex || isNaN(taskIndex)) {
                await m.reply(`❌ Masukkan nomor tugas yang akan ditandai selesai\nContoh: ${prefix}task done 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_tasks WHERE user_id = ? ORDER BY is_completed, priority = 'high' DESC, due_date ASC`, 
                [userId], async (err, tasks) => {
                if (err || !tasks.length || taskIndex < 1 || taskIndex > tasks.length) {
                    await m.reply('❌ Nomor tugas tidak valid');
                    return;
                }
                
                const task = tasks[taskIndex - 1];
                
                db.run(`UPDATE user_tasks SET is_completed = ? WHERE id = ?`, 
                    [!task.is_completed, task.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal mengubah status tugas');
                        return;
                    }
                    
                    const newStatus = !task.is_completed ? 'selesai' : 'belum selesai';
                    m.reply(`✅ Tugas "${task.title}" ditandai ${newStatus}`);
                });
            });
            return;
        }
        
        // Hapus tugas
        if (subCommand === 'delete' || subCommand === 'hapus') {
            const taskIndex = parseInt(args[1]);
            
            if (!taskIndex || isNaN(taskIndex)) {
                await m.reply(`❌ Masukkan nomor tugas yang akan dihapus\nContoh: ${prefix}task delete 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_tasks WHERE user_id = ? ORDER BY is_completed, priority = 'high' DESC, due_date ASC`, 
                [userId], async (err, tasks) => {
                if (err || !tasks.length || taskIndex < 1 || taskIndex > tasks.length) {
                    await m.reply('❌ Nomor tugas tidak valid');
                    return;
                }
                
                const task = tasks[taskIndex - 1];
                
                db.run(`DELETE FROM user_tasks WHERE id = ?`, [task.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal menghapus tugas');
                        return;
                    }
                    
                    m.reply(`✅ Tugas berhasil dihapus: *${task.title}*`);
                });
            });
            return;
        }
        
        // Tetapkan prioritas
        if (subCommand === 'priority' || subCommand === 'prioritas') {
            const taskIndex = parseInt(args[1]);
            const priority = args[2]?.toLowerCase();
            
            if (!taskIndex || isNaN(taskIndex) || !priority || !['low', 'medium', 'high', 'rendah', 'sedang', 'tinggi'].includes(priority)) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}task priority 1 high`);
                return;
            }
            
            let priorityValue;
            if (['rendah', 'low'].includes(priority)) priorityValue = 'low';
            else if (['sedang', 'medium'].includes(priority)) priorityValue = 'medium';
            else priorityValue = 'high';
            
            db.all(`SELECT * FROM user_tasks WHERE user_id = ? ORDER BY is_completed, priority = 'high' DESC, due_date ASC`, 
                [userId], async (err, tasks) => {
                if (err || !tasks.length || taskIndex < 1 || taskIndex > tasks.length) {
                    await m.reply('❌ Nomor tugas tidak valid');
                    return;
                }
                
                const task = tasks[taskIndex - 1];
                
                db.run(`UPDATE user_tasks SET priority = ? WHERE id = ?`, 
                    [priorityValue, task.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal mengubah prioritas tugas');
                        return;
                    }
                    
                    m.reply(`✅ Prioritas tugas "${task.title}" diubah menjadi *${priorityValue}*`);
                });
            });
            return;
        }
        
        // Tetapkan deadline
        if (subCommand === 'deadline' || subCommand === 'due') {
            const taskIndex = parseInt(args[1]);
            const dateString = args.slice(2).join(' ');
            
            if (!taskIndex || isNaN(taskIndex) || !dateString) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}task deadline 1 2023-12-31`);
                return;
            }
            
            const dueDate = moment(dateString, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY']);
            
            if (!dueDate.isValid()) {
                await m.reply(`❌ Format tanggal tidak valid\nContoh format: YYYY-MM-DD atau DD-MM-YYYY`);
                return;
            }
            
            db.all(`SELECT * FROM user_tasks WHERE user_id = ? ORDER BY is_completed, priority = 'high' DESC, due_date ASC`, 
                [userId], async (err, tasks) => {
                if (err || !tasks.length || taskIndex < 1 || taskIndex > tasks.length) {
                    await m.reply('❌ Nomor tugas tidak valid');
                    return;
                }
                
                const task = tasks[taskIndex - 1];
                
                db.run(`UPDATE user_tasks SET due_date = ? WHERE id = ?`, 
                    [dueDate.format('YYYY-MM-DD'), task.id], function(err) {
                    if (err) {
                        console.error(err);
                        m.reply('❌ Gagal mengatur deadline tugas');
                        return;
                    }
                    
                    m.reply(`✅ Deadline tugas "${task.title}" diatur ke *${dueDate.format('DD MMMM YYYY')}*`);
                });
            });
            return;
        }
        
        // Bantuan
        if (subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `📋 *BANTUAN TASK MANAGER*\n\n` +
                    `🔹 ${prefix}task - Lihat daftar tugas\n` +
                    `🔹 ${prefix}task add [judul] - Tambah tugas baru\n` +
                    `🔹 ${prefix}task done [nomor] - Tandai tugas selesai/belum\n` +
                    `🔹 ${prefix}task delete [nomor] - Hapus tugas\n` +
                    `🔹 ${prefix}task priority [nomor] [low/medium/high] - Atur prioritas\n` +
                    `🔹 ${prefix}task deadline [nomor] [YYYY-MM-DD] - Atur deadline\n`;
            
            await m.reply(helpText);
            return;
        }
        
        // Perintah tidak dikenal
        await m.reply(`❓ Perintah tidak dikenal\nGunakan ${prefix}task help untuk melihat bantuan`);
        
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat mengelola tugas');
        await m.react('❌');
    }
}; 