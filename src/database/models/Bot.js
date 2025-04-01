import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import moment from 'moment';
import path from 'path';
import fs from 'fs';

// Inisialisasi struktur database
const defaultData = {
    jadibot_sessions: [],
    rental_plans: [
        { id: 1, name: 'Basic', duration_days: 30, price: 100000 },
        { id: 2, name: 'Premium', duration_days: 30, price: 200000 },
        { id: 3, name: 'VIP', duration_days: 30, price: 300000 }
    ],
    bot_rentals: []
};

// Buat direktori database jika belum ada
const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Inisialisasi lowdb
const adapter = new JSONFile(path.join(dbDir, 'db.json'));
const db = new Low(adapter, defaultData);

class Bot {
    static async createJadiBot(userId, sessionId, duration = 1) {
        await db.read();
        const expiresAt = moment().add(duration, 'days').format('YYYY-MM-DD HH:mm:ss');

        const newSession = {
            id: Date.now(),
            user_id: userId,
            session_id: sessionId,
            expires_at: expiresAt,
            is_active: true
        };

        db.data.jadibot_sessions.push(newSession);
        await db.write();
        return newSession.id;
    }

    static async checkJadiBotSession(sessionId) {
        await db.read();
        const now = moment().format('YYYY-MM-DD HH:mm:ss');

        return db.data.jadibot_sessions.find(session =>
            session.session_id === sessionId &&
            session.is_active &&
            moment(session.expires_at).isAfter(now)
        );
    }

    static async getRentalPlans() {
        await db.read();
        return db.data.rental_plans;
    }

    static async getRentalPlan(planType) {
        await db.read();
        return db.data.rental_plans.find(plan => plan.id === planType);
    }

    static async createRental(groupId, renterId, planType) {
        await db.read();
        const plan = await this.getRentalPlan(planType);

        if (!plan) {
            throw new Error('Plan tidak valid');
        }

        const endDate = moment().add(plan.duration_days, 'days').format('YYYY-MM-DD HH:mm:ss');
        const newRental = {
            id: Date.now(),
            group_id: groupId,
            renter_id: renterId,
            plan_type: planType,
            end_date: endDate,
            is_active: true,
            payment_status: 'pending'
        };

        db.data.bot_rentals.push(newRental);
        await db.write();

        return {
            rentalId: newRental.id,
            plan,
            endDate
        };
    }

    static async checkRental(groupId) {
        await db.read();
        const now = moment().format('YYYY-MM-DD HH:mm:ss');

        return db.data.bot_rentals.find(rental =>
            rental.group_id === groupId &&
            rental.is_active &&
            moment(rental.end_date).isAfter(now)
        );
    }

    static async updatePaymentStatus(rentalId, status) {
        await db.read();
        const rental = db.data.bot_rentals.find(r => r.id === rentalId);

        if (rental) {
            rental.payment_status = status;
            await db.write();
        }
    }
}

export default Bot;