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
        try {
            await db.read()
            const user = db.data.users.find(u => u.phone === phone)
            if (!user) throw new Error('User tidak ditemukan 😢')

            const now = new Date()
            
            // Debug log sebelum update
            console.log('Current user data:', user)
            
            // Cek last_daily dari database
            if (user.last_daily) {
                const lastDaily = new Date(user.last_daily)
                const timeDiff = now - lastDaily
                const hoursLeft = Math.ceil((86400000 - timeDiff) / 3600000)
                
                console.log('Time difference (ms):', timeDiff)
                
                if (timeDiff < 86400000) {
                    throw new Error(`⏰ Tunggu ${hoursLeft} jam lagi untuk daily reward berikutnya!`)
                }
            }

            const dailyExp = 1000
            const result = await this.addExp(phone, dailyExp)

            // Update last_daily
            const userIndex = db.data.users.findIndex(u => u.phone === phone)
            if (userIndex !== -1) {
                db.data.users[userIndex] = {
                    ...db.data.users[userIndex],
                    last_daily: now.toISOString()
                }
                
                // Pastikan perubahan tersimpan
                await db.write()
                
                // Debug log setelah update
                console.log('Updated user data:', db.data.users[userIndex])
            }

            return {
                error: false,
                ...result,
                dailyExp
            }
        } catch (error) {
            throw error
        }
    }

    static async getLeaderboard(limit = 10) {
        await db.read()
        return [...db.data.users]
            .sort((a, b) => b.exp - a.exp)
            .slice(0, limit)
            .map(user => ({
                name: user.name,
                level: user.level,
                exp: user.exp,
                total_messages: user.total_messages,
                total_commands: user.total_commands
            }))
    }

    static async incrementCommand(phone) {
        await db.read()
        const user = db.data.users.find(u => u.phone === phone)
        if (!user) throw new Error('Gak nemu user waktu nambah command 😩')

        user.total_commands += 1
        await db.write()
    }

    static async getUserRank(phone) {
        await db.read();
        
        // Sort users berdasarkan exp
        const sortedUsers = [...db.data.users].sort((a, b) => b.exp - a.exp);
        
        // Cari posisi user
        const position = sortedUsers.findIndex(user => user.phone === phone) + 1;
        
        if (position === 0) return null;
        
        return {
            position,
            total: sortedUsers.length
        };
    }

    static async updateBio(phone, type, value) {
        await db.read();
        const user = db.data.users.find(u => u.phone === phone);
        if (!user) throw new Error('User tidak ditemukan');
        
        user[type] = value;
        await db.write();
        return true;
    }
}

export default User
