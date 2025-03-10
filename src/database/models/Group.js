import db from '../config.js';

class Group {
    static async initGroup(groupId) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO group_settings (
                group_id, 
                welcome_message, 
                goodbye_message,
                autoai
            ) VALUES (?, ?, ?, ?)`,
            [
                groupId,
                'Selamat datang @user di @group!\n\nSilakan baca deskripsi grup ya~',
                'Selamat tinggal @user!\nSemoga kita berjumpa lagi di lain waktu.',
                false
            ],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static async getSettings(groupId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM group_settings WHERE group_id = ?',
            [groupId],
            (err, row) => {
                if (err) reject(err);
                resolve(row || {});
            });
        });
    }

    static async updateSetting(groupId, setting, value) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE group_settings SET ${setting} = ? WHERE group_id = ?`,
            [value, groupId],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static async checkSpam(userId, groupId) {
        return new Promise(async (resolve, reject) => {
            try {
                const settings = await this.getSettings(groupId);
                if (!settings.antispam) {
                    resolve({ isSpam: false });
                    return;
                }

                db.get(`SELECT * FROM spam_detection 
                    WHERE user_id = ? AND group_id = ? 
                    AND last_message > datetime('now', '-10 seconds')`,
                [userId, groupId],
                (err, row) => {
                    if (err) reject(err);
                    if (!row) {
                        this.resetSpamCount(userId, groupId);
                        resolve({ isSpam: false });
                    } else {
                        const isSpam = row.message_count >= 5;
                        this.updateSpamCount(userId, groupId, row.message_count + 1);
                        resolve({ 
                            isSpam,
                            warningCount: row.warning_count,
                            messageCount: row.message_count
                        });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async resetSpamCount(userId, groupId) {
        db.run(`INSERT OR REPLACE INTO spam_detection 
            (user_id, group_id, message_count, last_message, warning_count)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP, 
                COALESCE((SELECT warning_count FROM spam_detection 
                WHERE user_id = ? AND group_id = ?), 0))`,
        [userId, groupId, userId, groupId]);
    }

    static async updateSpamCount(userId, groupId, count) {
        db.run(`UPDATE spam_detection 
            SET message_count = ?, last_message = CURRENT_TIMESTAMP
            WHERE user_id = ? AND group_id = ?`,
        [count, userId, groupId]);
    }

    static async incrementWarning(userId, groupId) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE spam_detection 
                SET warning_count = warning_count + 1
                WHERE user_id = ? AND group_id = ?`,
            [userId, groupId],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

export default Group; 