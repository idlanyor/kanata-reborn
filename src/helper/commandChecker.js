import db from '../database/config.js';

export const checkCommand = async (command, m, noTel, id) => {
    try {
        // Cek apakah command RPG
        if (['profile', 'inventory', 'hunt', 'mulung', 'dungeon', 'skill', 'quest'].includes(command)) {
            // Inisialisasi player jika belum ada
            await new Promise((resolve, reject) => {
                db.run(`INSERT OR IGNORE INTO rpg_stats (user_id) VALUES (?)`, 
                [noTel], 
                (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        // Cek apakah command grup
        if (['settings', 'welcome', 'goodbye'].includes(command)) {
            if (!id.endsWith('@g.us')) {
                throw new Error('Command ini hanya bisa digunakan di grup!');
            }
            
            // Inisialisasi pengaturan grup jika belum ada
            await new Promise((resolve, reject) => {
                db.run(`INSERT OR IGNORE INTO group_settings (group_id) VALUES (?)`,
                [id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        return true;
    } catch (error) {
        console.error(`Error checking command ${command}:`, error);
        return false;
    }
}; 