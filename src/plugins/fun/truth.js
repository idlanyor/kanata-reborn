const truths = [
    "Siapa crush kamu saat ini?",
    "Kapan terakhir kali berbohong?",
    "Apa mimpi terburukmu?",
    "Hal paling memalukan yang pernah kamu lakukan?",
    "Siapa orang yang diam-diam kamu sukai?",
    "Apa kebohongan terbesar yang pernah kamu katakan?",
    "Apa yang membuatmu bahagia hari ini?",
    "Ceritakan momen paling memalukan dalam hidupmu",
    "Siapa orang yang paling kamu sayangi?",
    "Apa rahasia yang belum pernah kamu ceritakan ke siapapun?"
];

export default async ({ sock, m, id }) => {
    try {
        const truth = truths[Math.floor(Math.random() * truths.length)];
        await sock.sendMessage(id, { 
            text: `*🤔 TRUTH*\n\n${truth}\n\n_Jawab dengan jujur ya!_` 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'truth';
export const tags = ['fun'];
export const command = ['truth'];
export const help = 'Random pertanyaan truth\nPenggunaan: !truth'; 