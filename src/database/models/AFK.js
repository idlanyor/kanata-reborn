import db from '../config.js';
import moment from 'moment';

class AFK {
    static async setAFK(userId, reason) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO afk_status (user_id, reason, start_time) 
                   VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [userId, reason],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static async removeAFK(userId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM afk_status WHERE user_id = ?',
            [userId],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static async getAFK(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM afk_status WHERE user_id = ?',
            [userId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async updateMentions(userId, mentionedBy) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE afk_status 
                   SET mentioned_by = CASE 
                        WHEN mentioned_by IS NULL THEN ? 
                        ELSE mentioned_by || ',' || ?
                   END 
                   WHERE user_id = ?`,
            [mentionedBy, mentionedBy, userId],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static formatDuration(startTime) {
        const duration = moment.duration(moment().diff(moment(startTime)));
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes()) % 60;
        
        if (hours > 0) {
            return `${hours} jam ${minutes} menit`;
        }
        return `${minutes} menit`;
    }
}

export default AFK; 