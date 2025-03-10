import db from '../config.js';

class Session {
    static async create(sessionId, data) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT OR REPLACE INTO sessions (session_id, session_data) VALUES (?, ?)`);
            stmt.run([sessionId, JSON.stringify(data)], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                    return;
                }
                // Gunakan rowid sebagai pengganti lastID
                db.get('SELECT last_insert_rowid() as id', (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row.id);
                });
            });
        });
    }

    static async get(sessionId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM sessions WHERE session_id = ?', [sessionId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    try {
                        row.session_data = JSON.parse(row.session_data);
                    } catch (e) {
                        console.error('Error parsing session data:', e);
                        row.session_data = {};
                    }
                }
                resolve(row);
            });
        });
    }

    static async update(sessionId, data) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`UPDATE sessions SET session_data = ? WHERE session_id = ?`);
            stmt.run([JSON.stringify(data), sessionId], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            });
        });
    }

    static async delete(sessionId) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare('DELETE FROM sessions WHERE session_id = ?');
            stmt.run([sessionId], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            });
        });
    }

    static async clear() {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM sessions', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    static async exists(sessionId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT 1 FROM sessions WHERE session_id = ?', [sessionId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!row);
            });
        });
    }

    static async updateLastActive(sessionId) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE session_id = ?',
                [sessionId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                });
        });
    }

    static async getActive() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM sessions WHERE last_active > datetime("now", "-1 hour")',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
        });
    }
}

export default Session; 