import moment from 'moment';
import db from '../../database/config.js';

// Inisialisasi tabel notes
function initNotesTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            title TEXT,
            content TEXT,
            category TEXT DEFAULT 'Umum',
            is_pinned BOOLEAN DEFAULT false,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Format tampilan catatan
function formatNote(note, index = null) {
    const pinIcon = note.is_pinned ? '📌 ' : '';
    const indexStr = index !== null ? `${index + 1}. ` : '';
    
    return `${indexStr}${pinIcon}*${note.title}*\n` +
           `${note.content}\n` +
           `📂 Kategori: ${note.category}\n` +
           `📅 Dibuat: ${moment(note.created_at).format('DD/MM/YY HH:mm')}\n` +
           (note.updated_at !== note.created_at ? 
            `✏️ Diubah: ${moment(note.updated_at).format('DD/MM/YY HH:mm')}\n` : '') +
           `───────────────`;
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        initNotesTable();
        const userId = m.sender;
        const subCommand = args[0]?.toLowerCase();
        
        // Bantuan
        if (!subCommand || subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `📝 *BANTUAN NOTES MANAGER*\n\n` +
                    `🔹 ${prefix}note - Lihat daftar catatan\n` +
                    `🔹 ${prefix}note add <judul> | <isi> | [kategori] - Tambah catatan baru\n` +
                    `🔹 ${prefix}note view <nomor> - Lihat detail catatan\n` +
                    `🔹 ${prefix}note edit <nomor> | <isi baru> - Edit catatan\n` +
                    `🔹 ${prefix}note delete <nomor> - Hapus catatan\n` +
                    `🔹 ${prefix}note pin <nomor> - Pin/Unpin catatan\n` +
                    `🔹 ${prefix}note search <kata kunci> - Cari catatan\n` +
                    `🔹 ${prefix}note category <kategori> - Lihat catatan per kategori\n\n` +
                    `Contoh:\n` +
                    `${prefix}note add Resep Nasi Goreng | Bahan: nasi, telur, dll | Makanan\n` +
                    `${prefix}note search resep`;
            
            await m.reply(helpText);
            return;
        }
        
        // Tambah catatan baru
        if (subCommand === 'add' || subCommand === 'tambah') {
            const content = args.slice(1).join(' ');
            const [title, noteContent, category = 'Umum'] = content.split('|').map(s => s.trim());
            
            if (!title || !noteContent) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}note add Judul | Isi catatan | Kategori`);
                return;
            }
            
            db.run(`INSERT INTO user_notes (user_id, title, content, category) VALUES (?, ?, ?, ?)`,
                [userId, title, noteContent, category],
                async function(err) {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal menambahkan catatan');
                        return;
                    }
                    
                    await m.reply(`✅ Catatan berhasil ditambahkan:\n\n${formatNote({
                        title,
                        content: noteContent,
                        category,
                        created_at: new Date(),
                        updated_at: new Date()
                    })}`);
                }
            );
            return;
        }
        
        // Lihat detail catatan
        if (subCommand === 'view' || subCommand === 'lihat') {
            const noteIndex = parseInt(args[1]);
            
            if (!noteIndex || isNaN(noteIndex)) {
                await m.reply(`❌ Masukkan nomor catatan\nContoh: ${prefix}note view 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC`,
                [userId],
                async (err, notes) => {
                    if (err || !notes.length || noteIndex < 1 || noteIndex > notes.length) {
                        await m.reply('❌ Catatan tidak ditemukan');
                        return;
                    }
                    
                    const note = notes[noteIndex - 1];
                    await m.reply(formatNote(note));
                }
            );
            return;
        }
        
        // Edit catatan
        if (subCommand === 'edit') {
            const noteIndex = parseInt(args[1]);
            const newContent = args.slice(2).join(' ');
            
            if (!noteIndex || isNaN(noteIndex) || !newContent) {
                await m.reply(`❌ Format tidak valid\nContoh: ${prefix}note edit 1 | Isi catatan baru`);
                return;
            }
            
            db.all(`SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC`,
                [userId],
                async (err, notes) => {
                    if (err || !notes.length || noteIndex < 1 || noteIndex > notes.length) {
                        await m.reply('❌ Catatan tidak ditemukan');
                        return;
                    }
                    
                    const note = notes[noteIndex - 1];
                    const [content] = newContent.split('|').map(s => s.trim());
                    
                    db.run(`UPDATE user_notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [content, note.id],
                        async function(err) {
                            if (err) {
                                console.error(err);
                                await m.reply('❌ Gagal mengubah catatan');
                                return;
                            }
                            
                            await m.reply(`✅ Catatan berhasil diubah:\n\n${formatNote({
                                ...note,
                                content,
                                updated_at: new Date()
                            })}`);
                        }
                    );
                }
            );
            return;
        }
        
        // Hapus catatan
        if (subCommand === 'delete' || subCommand === 'hapus') {
            const noteIndex = parseInt(args[1]);
            
            if (!noteIndex || isNaN(noteIndex)) {
                await m.reply(`❌ Masukkan nomor catatan\nContoh: ${prefix}note delete 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC`,
                [userId],
                async (err, notes) => {
                    if (err || !notes.length || noteIndex < 1 || noteIndex > notes.length) {
                        await m.reply('❌ Catatan tidak ditemukan');
                        return;
                    }
                    
                    const note = notes[noteIndex - 1];
                    
                    db.run(`DELETE FROM user_notes WHERE id = ?`, [note.id],
                        async function(err) {
                            if (err) {
                                console.error(err);
                                await m.reply('❌ Gagal menghapus catatan');
                                return;
                            }
                            
                            await m.reply(`✅ Catatan berhasil dihapus:\n\n${formatNote(note)}`);
                        }
                    );
                }
            );
            return;
        }
        
        // Pin/Unpin catatan
        if (subCommand === 'pin') {
            const noteIndex = parseInt(args[1]);
            
            if (!noteIndex || isNaN(noteIndex)) {
                await m.reply(`❌ Masukkan nomor catatan\nContoh: ${prefix}note pin 1`);
                return;
            }
            
            db.all(`SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC`,
                [userId],
                async (err, notes) => {
                    if (err || !notes.length || noteIndex < 1 || noteIndex > notes.length) {
                        await m.reply('❌ Catatan tidak ditemukan');
                        return;
                    }
                    
                    const note = notes[noteIndex - 1];
                    
                    db.run(`UPDATE user_notes SET is_pinned = NOT is_pinned WHERE id = ?`,
                        [note.id],
                        async function(err) {
                            if (err) {
                                console.error(err);
                                await m.reply('❌ Gagal mengubah status pin catatan');
                                return;
                            }
                            
                            const status = !note.is_pinned ? 'dipin' : 'diunpin';
                            await m.reply(`✅ Catatan berhasil ${status}:\n\n${formatNote({
                                ...note,
                                is_pinned: !note.is_pinned
                            })}`);
                        }
                    );
                }
            );
            return;
        }
        
        // Cari catatan
        if (subCommand === 'search' || subCommand === 'cari') {
            const keyword = args.slice(1).join(' ').toLowerCase();
            
            if (!keyword) {
                await m.reply(`❌ Masukkan kata kunci pencarian\nContoh: ${prefix}note search resep`);
                return;
            }
            
            db.all(`SELECT * FROM user_notes 
                   WHERE user_id = ? AND (
                       LOWER(title) LIKE ? OR 
                       LOWER(content) LIKE ? OR 
                       LOWER(category) LIKE ?
                   ) ORDER BY is_pinned DESC, created_at DESC`,
                [userId, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
                async (err, notes) => {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mencari catatan');
                        return;
                    }
                    
                    if (notes.length === 0) {
                        await m.reply(`📝 Tidak ditemukan catatan dengan kata kunci "${keyword}"`);
                        return;
                    }
                    
                    let response = `📝 *HASIL PENCARIAN*\nKata kunci: "${keyword}"\n\n`;
                    notes.forEach((note, index) => {
                        response += formatNote(note, index) + '\n';
                    });
                    
                    await m.reply(response);
                }
            );
            return;
        }
        
        // Lihat catatan per kategori
        if (subCommand === 'category' || subCommand === 'kategori') {
            const category = args.slice(1).join(' ');
            
            if (!category) {
                // Tampilkan daftar kategori yang ada
                db.all(`SELECT category, COUNT(*) as count 
                       FROM user_notes 
                       WHERE user_id = ? 
                       GROUP BY category 
                       ORDER BY count DESC`,
                    [userId],
                    async (err, categories) => {
                        if (err) {
                            console.error(err);
                            await m.reply('❌ Gagal mengambil daftar kategori');
                            return;
                        }
                        
                        if (categories.length === 0) {
                            await m.reply('📝 Belum ada catatan');
                            return;
                        }
                        
                        let response = `📂 *DAFTAR KATEGORI*\n\n`;
                        categories.forEach(cat => {
                            response += `📁 ${cat.category} (${cat.count})\n`;
                        });
                        
                        await m.reply(response);
                    }
                );
                return;
            }
            
            // Tampilkan catatan dalam kategori tertentu
            db.all(`SELECT * FROM user_notes 
                   WHERE user_id = ? AND LOWER(category) = LOWER(?) 
                   ORDER BY is_pinned DESC, created_at DESC`,
                [userId, category],
                async (err, notes) => {
                    if (err) {
                        console.error(err);
                        await m.reply('❌ Gagal mengambil catatan');
                        return;
                    }
                    
                    if (notes.length === 0) {
                        await m.reply(`📝 Tidak ada catatan dalam kategori "${category}"`);
                        return;
                    }
                    
                    let response = `📂 *CATATAN KATEGORI: ${category.toUpperCase()}*\n\n`;
                    notes.forEach((note, index) => {
                        response += formatNote(note, index) + '\n';
                    });
                    
                    await m.reply(response);
                }
            );
            return;
        }
        
        // Default: tampilkan semua catatan
        db.all(`SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC`,
            [userId],
            async (err, notes) => {
                if (err) {
                    console.error(err);
                    await m.reply('❌ Gagal mengambil daftar catatan');
                    return;
                }
                
                if (notes.length === 0) {
                    await m.reply('📝 Belum ada catatan tersimpan');
                    return;
                }
                
                let response = `📝 *DAFTAR CATATAN*\n\n`;
                notes.forEach((note, index) => {
                    response += formatNote(note, index) + '\n';
                });
                
                await m.reply(response);
            }
        );
        
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat mengelola catatan');
        await m.react('❌');
    }
}; 