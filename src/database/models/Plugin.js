import db from '../config.js';

class Plugin {
    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM plugins', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async create(name, path) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO plugins (name, path) VALUES (?, ?)', 
                [name, path], 
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                });
        });
    }

    static async updateStatus(id, isActive) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE plugins SET is_active = ? WHERE id = ?',
                [isActive, id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                });
        });
    }
}

export default Plugin; 