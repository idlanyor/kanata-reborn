import db from '../config.js';
import moment from 'moment';

class AFK {
    static async setAFK(userId, reason) {
        await db.read();
        
        // Check if afk_status array exists, create if not
        if (!db.data.afk_status) {
            db.data.afk_status = [];
        }
        
        // Find existing AFK status or create new entry
        const existingIndex = db.data.afk_status.findIndex(afk => afk.user_id === userId);
        
        const afkData = {
            user_id: userId,
            reason: reason,
            start_time: new Date().toISOString(),
            mentioned_by: null
        };
        
        if (existingIndex !== -1) {
            db.data.afk_status[existingIndex] = afkData;
        } else {
            db.data.afk_status.push(afkData);
        }
        
        await db.write();
        return afkData;
    }

    static async removeAFK(userId) {
        await db.read();
        
        if (!db.data.afk_status) return;
        
        const initialLength = db.data.afk_status.length;
        db.data.afk_status = db.data.afk_status.filter(afk => afk.user_id !== userId);
        
        if (db.data.afk_status.length !== initialLength) {
            await db.write();
        }
        
        return true;
    }

    static async getAFK(userId) {
        await db.read();
        
        if (!db.data.afk_status) return null;
        
        return db.data.afk_status.find(afk => afk.user_id === userId) || null;
    }

    static async updateMentions(userId, mentionedBy) {
        await db.read();
        
        if (!db.data.afk_status) return null;
        
        const afkStatus = db.data.afk_status.find(afk => afk.user_id === userId);
        if (!afkStatus) return null;
        
        if (!afkStatus.mentioned_by) {
            afkStatus.mentioned_by = mentionedBy;
        } else {
            afkStatus.mentioned_by += ',' + mentionedBy;
        }
        
        await db.write();
        return afkStatus;
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