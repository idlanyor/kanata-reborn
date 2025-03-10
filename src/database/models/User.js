import db from '../config.js';

class User {
    static async create(phone, name) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (
                phone, 
                name, 
                exp,
                level,
                last_daily,
                total_messages,
                total_commands,
                join_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [phone, name, 0, 1, null, 0, 0, new Date().toISOString()],
            function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    static async getUser(phone) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async addExp(phone, expAmount) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getUser(phone);
                if (!user) {
                    reject(new Error('User tidak ditemukan'));
                    return;
                }

                // Hitung level baru
                const currentExp = user.exp + expAmount;
                const currentLevel = user.level;
                const expNeeded = currentLevel * 1000; // Setiap level butuh exp lebih banyak

                let newLevel = currentLevel;
                let levelUp = false;

                // Cek apakah naik level
                if (currentExp >= expNeeded) {
                    newLevel = currentLevel + 1;
                    levelUp = true;
                }

                // Update database
                db.run(`UPDATE users SET 
                    exp = ?,
                    level = ?,
                    total_messages = total_messages + 1
                    WHERE phone = ?`,
                [currentExp, newLevel, phone],
                (err) => {
                    if (err) reject(err);
                    resolve({
                        levelUp,
                        newLevel,
                        currentExp,
                        expNeeded
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async claimDaily(phone) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getUser(phone);
                if (!user) {
                    reject(new Error('User tidak ditemukan'));
                    return;
                }

                const lastDaily = user.last_daily ? new Date(user.last_daily) : null;
                const now = new Date();

                // Cek apakah sudah 24 jam sejak klaim terakhir
                if (lastDaily && (now - lastDaily) < 86400000) { // 24 jam dalam milidetik
                    reject(new Error('Daily reward sudah diambil hari ini'));
                    return;
                }

                const dailyExp = 1000; // Exp yang didapat dari daily
                const dailyResult = await this.addExp(phone, dailyExp);

                // Update waktu klaim daily
                db.run('UPDATE users SET last_daily = ? WHERE phone = ?',
                [now.toISOString(), phone],
                (err) => {
                    if (err) reject(err);
                    resolve({
                        ...dailyResult,
                        dailyExp
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getLeaderboard(limit = 10) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT 
                name, 
                phone, 
                level, 
                exp,
                total_messages,
                total_commands 
                FROM users 
                ORDER BY level DESC, exp DESC 
                LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async incrementCommand(phone) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET total_commands = total_commands + 1 WHERE phone = ?',
            [phone],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

export default User; 