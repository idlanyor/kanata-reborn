import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import moment from 'moment';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const defaultData = {
    group_settings: [],
    spam_detection: []
};


// Inisialisasi lowdb

const adapter = new JSONFile(path.join(__dirname, 'groups.json'));
const db = new Low(adapter, defaultData);

class Group {
    static async initGroup(groupId) {
        await db.read();

        // Cek apakah grup sudah ada
        const existingGroup = db.data.group_settings.find(g => g.group_id === groupId);
        if (existingGroup) return;

        // Tambah grup baru
        db.data.group_settings.push({
            group_id: groupId,
            welcome_message: 'Selamat datang @user di @group!\n\nSilakan baca deskripsi grup ya~',
            goodbye_message: 'Selamat tinggal @user!\nSemoga kita berjumpa lagi di lain waktu.',
            autoai: false,
            antilink: false,
            welcome: true,
            goodbye: false,
            antitoxic: false,
            antipromosi: false,
            only_admin: false
        });

        await db.write();
    }

    static async getSettings(groupId) {
        await db.read();
        return db.data.group_settings.find(g => g.group_id === groupId) || {};
    }

    static async updateSetting(groupId, setting, value) {
        await db.read();
        const groupIndex = db.data.group_settings.findIndex(g => g.group_id === groupId);

        if (groupIndex !== -1) {
            db.data.group_settings[groupIndex][setting] = value;
            await db.write();
        }
    }

    static async checkSpam(userId, groupId) {
        await db.read();
        const settings = await this.getSettings(groupId);

        if (!settings.antispam) {
            return { isSpam: false };
        }

        const spamData = db.data.spam_detection.find(
            s => s.user_id === userId &&
                s.group_id === groupId &&
                moment(s.last_message).isAfter(moment().subtract(10, 'seconds'))
        );

        if (!spamData) {
            await this.resetSpamCount(userId, groupId);
            return { isSpam: false };
        }

        const isSpam = spamData.message_count >= 5;
        await this.updateSpamCount(userId, groupId, spamData.message_count + 1);

        return {
            isSpam,
            warningCount: spamData.warning_count,
            messageCount: spamData.message_count
        };
    }

    static async resetSpamCount(userId, groupId) {
        await db.read();

        const existingData = db.data.spam_detection.find(
            s => s.user_id === userId && s.group_id === groupId
        );

        if (existingData) {
            existingData.message_count = 1;
            existingData.last_message = moment().format();
        } else {
            db.data.spam_detection.push({
                user_id: userId,
                group_id: groupId,
                message_count: 1,
                last_message: moment().format(),
                warning_count: 0
            });
        }

        await db.write();
    }

    static async updateSpamCount(userId, groupId, count) {
        await db.read();

        const spamData = db.data.spam_detection.find(
            s => s.user_id === userId && s.group_id === groupId
        );

        if (spamData) {
            spamData.message_count = count;
            spamData.last_message = moment().format();
            await db.write();
        }
    }

    static async incrementWarning(userId, groupId) {
        await db.read();

        const spamData = db.data.spam_detection.find(
            s => s.user_id === userId && s.group_id === groupId
        );

        if (spamData) {
            spamData.warning_count += 1;
            await db.write();
        }
    }
}

export default Group;