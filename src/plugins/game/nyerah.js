export const handler = 'nyerah';
export const description = 'Menyerah dalam game tebak-tebakan';

export default async ({ sock, m, id }) => {
    try {
        // Cek apakah ada game aktif
        if (!global.tebakGame || !global.tebakGame[id] || !global.tebakGame[id].session) {
            await sock.sendMessage(id, { 
                text: '❓ Tidak ada game yang sedang berlangsung.',
            });
            return;
        }

        // Ambil jawaban dari game aktif
        const answer = global.tebakGame[id].answer;
        const gameType = global.tebakGame[id].type;

        // Clear timeout
        clearTimeout(global.tebakGame[id].timeout);
        
        // Hapus sesi game
        delete global.tebakGame[id];

        // Kirim pesan menyerah
        await sock.sendMessage(id, { 
            text: `😔 *Kamu menyerah!*\n\n🎮 Game: Tebak ${gameType}\n🔍 Jawaban: *${answer}*`,
            contextInfo: {
                externalAdReply: {
                    title: '👋 Game Over',
                    body: 'Silahkan coba lagi nanti',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

    } catch (error) {
        console.error('Error in nyerah command:', error);
        await sock.sendMessage(id, { 
            text: `❌ *Terjadi kesalahan:*\n${error.message}`
        });
    }
};

export const help = {
    name: 'nyerah',
    description: 'Menyerah dalam game tebak-tebakan',
    usage: '.nyerah'
}; 