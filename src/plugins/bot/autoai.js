import Group from '../../database/models/Group.js';

export const description = "🤖 Pengaturan Auto AI untuk grup";
export const handler = "autoai";

export default async ({ sock, m, id, psn }) => {
    try {
        if (!m.isGroup) {
            return await sock.sendMessage(id, {
                text: '❌ Perintah ini hanya bisa digunakan di grup!'
            });
        }

        // Inisialisasi grup kalau belum terdaftar
        await Group.initGroup(id);

        const settings = await Group.getSettings(id);

        // Kalau gak ada argumen (psn), tampilkan status
        if (!psn) {
            const status = settings.autoai ? '✅ Aktif' : '❌ Nonaktif';
            return await sock.sendMessage(id, {
                text: `*🤖 Status Auto AI:* ${status}\n\nGunakan:\n*.autoai on* - untuk mengaktifkan\n*.autoai off* - untuk menonaktifkan`
            });
        }

        const lower = psn.toLowerCase();

        if (!['on', 'off'].includes(lower)) {
            return await sock.sendMessage(id, {
                text: '❌ Format tidak valid. Gunakan: *autoai on* atau *autoai off*.'
            });
        }

        const isOn = lower === 'on';
        await Group.updateSetting(id, 'autoai', isOn);

        return await sock.sendMessage(id, {
            text: `✅ Auto AI berhasil ${isOn ? 'diaktifkan' : 'dinonaktifkan'}`
        });

    } catch (err) {
        console.error('[AutoAI Error]', err);
        return await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${err.message}`
        });
    }
};
