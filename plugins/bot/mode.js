import { checkOwner } from '../../helper/permission.js';
export const handler = 'mode'
export const description = "Mengatur mode bot (self/public/restricted)";

export default async ({ sock, m, id, psn, noTel }) => {
    try {
        // Cek apakah pengguna adalah owner
        if (!await checkOwner(sock, id, noTel)) return;

        if (!psn) {
            const currentMode = globalThis.botMode || 'public';
            await sock.sendMessage(id, {
                text: `🤖 *BOT MODE*\n\n` +
                     `Mode saat ini: *${currentMode}*\n\n` +
                     `Pilihan mode:\n` +
                     `• *self* - Hanya bisa diakses di private chat\n` +
                     `• *public* - Bisa diakses di grup & private\n` +
                     `• *restricted* - Bisa di grup tapi hanya owner\n\n` +
                     `Cara mengubah: .mode <pilihan>`,
                contextInfo: {
                    externalAdReply: {
                        title: '🤖 Bot Mode Settings',
                        body: `Current: ${currentMode}`,
                        thumbnailUrl: globalThis.kanataThumb,
                        sourceUrl: globalThis.newsLetterUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            return;
        }

        const mode = psn.toLowerCase();
        if (!['self', 'public', 'restricted'].includes(mode)) {
            await sock.sendMessage(id, {
                text: '❌ Mode tidak valid! Pilihan: self, public, restricted'
            });
            return;
        }

        // Set mode baru
        globalThis.botMode = mode;

        await sock.sendMessage(id, {
            text: `✅ Bot mode berhasil diubah ke: *${mode}*`,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Mode Updated',
                    body: `New mode: ${mode}`,
                    thumbnailUrl: globalThis.kanataThumb,
                    sourceUrl: globalThis.newsLetterUrl,
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '⚙️',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${error.message}`
        });
    }
};

export const help = "Mengatur mode bot (Owner Only)\nPenggunaan: .mode <self/public/restricted>"; 