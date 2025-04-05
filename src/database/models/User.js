import db from '../config.js'

class User {
    static async create(phone, name) {
        await db.read()
        const existing = db.data.users.find(u => u.phone === phone)
        if (existing) throw new Error('User sudah ada 🐒')

        const user = {
            phone,
            name,
            exp: 0,
            level: 1,
            last_daily: null,
            total_messages: 0,
            total_commands: 0,
            join_date: new Date().toISOString()
        }

        db.data.users.push(user)
        await db.write()
        return user
    }

    static async getUser(phone) {
        await db.read()
        return db.data.users.find(u => u.phone === phone) || null
    }

    static async addExp(phone, expAmount) {
        await db.read()
        const user = db.data.users.find(u => u.phone === phone)
        if (!user) throw new Error('User gak ketemu njir 😤')

        user.exp += expAmount
        user.total_messages += 1

        const expNeeded = user.level * 1000
        let levelUp = false

        if (user.exp >= expNeeded) {
            user.level += 1
            levelUp = true
        }

        await db.write()

        return {
            levelUp,
            newLevel: user.level,
            currentExp: user.exp,
            expNeeded
        }
    }

    static async claimDaily(phone) {
        await db.read()
        const user = db.data.users.find(u => u.phone === phone)
        if (!user) throw new Error('User ilang kaya mantan 😭')

        const now = new Date()
        const lastDaily = user.last_daily ? new Date(user.last_daily) : null

        if (lastDaily && (now - lastDaily) < 86400000) {
            throw new Error('Udah ngambil daily cok, sabar 24 jam 😡')
        }

        const dailyExp = 1000
        const result = await this.addExp(phone, dailyExp)

        user.last_daily = now.toISOString()
        await db.write()

        return {
            ...result,
            dailyExp
        }
    }

    static async getLeaderboard(limit = 10) {
        await db.read()
        return db.data.users
            .sort((a, b) => b.level !== a.level
                ? b.level - a.level
                : b.exp - a.exp)
            .slice(0, limit)
            .map(u => ({
                name: u.name,
                phone: u.phone,
                level: u.level,
                exp: u.exp,
                total_messages: u.total_messages,
                total_commands: u.total_commands
            }))
    }

    static async incrementCommand(phone) {
        await db.read()
        const user = db.data.users.find(u => u.phone === phone)
        if (!user) throw new Error('Gak nemu user waktu nambah command 😩')

        user.total_commands += 1
        await db.write()
    }
}

export default User
