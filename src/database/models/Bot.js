import db from '../config.js';
import moment from 'moment';

class Bot {
    static async createJadiBot(userId, sessionId, duration = 1) {
        return new Promise((resolve, reject) => {
            const expiresAt = moment().add(duration, 'days').format('YYYY-MM-DD HH:mm:ss');
            
            db.run(`INSERT INTO jadibot_sessions 
                (user_id, session_id, expires_at) 
                VALUES (?, ?, ?)`,
            [userId, sessionId, expiresAt],
            function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    static async checkJadiBotSession(sessionId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM jadibot_sessions 
                WHERE session_id = ? AND is_active = 1 
                AND expires_at > datetime('now')`,
            [sessionId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getRentalPlans() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM rental_plans', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async createRental(groupId, renterId, planType) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await this.getRentalPlan(planType);
                if (!plan) {
                    reject(new Error('Plan tidak valid'));
                    return;
                }

                const endDate = moment().add(plan.duration_days, 'days').format('YYYY-MM-DD HH:mm:ss');
                
                db.run(`INSERT INTO bot_rentals 
                    (group_id, renter_id, plan_type, end_date) 
                    VALUES (?, ?, ?, ?)`,
                [groupId, renterId, planType, endDate],
                function(err) {
                    if (err) reject(err);
                    resolve({
                        rentalId: this.lastID,
                        plan,
                        endDate
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async checkRental(groupId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM bot_rentals 
                WHERE group_id = ? AND is_active = 1 
                AND end_date > datetime('now')`,
            [groupId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async updatePaymentStatus(rentalId, status) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE bot_rentals 
                SET payment_status = ? 
                WHERE id = ?`,
            [status, rentalId],
            (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

export default Bot; 