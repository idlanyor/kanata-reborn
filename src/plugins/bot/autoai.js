import Group from '../../database/models/Group.js';

export const description = "🤖 Pengaturan Auto AI untuk grup";
export const handler = "autoai";

export default async ({ sock, m, id, psn,noTel }) => {
    try {
        if (!globalThis.isOwner(noTel)) return;
        // if (!id.endsWith('@g.us')) {
        //     await sock.sendMessage(id, {
        //         text: '❌ Perintah ini hanya bisa digunakan di grup!'
        //     });
        //     return;
        // }

        // Inisialisasi pengaturan grup jika belum ada
        await Group.initGroup(id);
        const settings = await Group.getSettings(id);

        if (!psn) {
            const status = settings.autoai ? '✅ Aktif' : '❌ Nonaktif';
            await sock.sendMessage(id, {
                text: `*🤖 Status Auto AI:* ${status}\n\nGunakan:\n*.autoai on* - untuk mengaktifkan\n*.autoai off* - untuk menonaktifkan`
            });
            return;
        }

        const value = psn.toLowerCase() === 'on';
        await Group.updateSetting(id, 'autoai', value);
        
        await sock.sendMessage(id, {
            text: `✅ Auto AI berhasil ${value ? 'diaktifkan' : 'dinonaktifkan'}`
        });

    } catch (error) {
        console.error('Error in autoai:', error);
        await sock.sendMessage(id, {
            text: `❌ Error: ${error.message}`
        });
    }
}; 