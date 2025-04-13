import { game } from "../../helper/hikaru.js"
import moment from 'moment';
export const handler = "tebakgambar"
export const description = "Tebak Gambar";

const gambar = async (id, sock) => {
    try {
        const response = await game('tebakgambar');
        const img = response.image;
        const caption = response.description;
        const answer = response.answer.toLowerCase().trim();

        console.log('New Game Session:', {
            id: id,
            answer: answer,
            rawAnswer: response.answer
        });

        await sock.sendMessage(id, { image: { url: img }, caption });

        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };

        console.log('Game state after creation:', global.tebakGame[id]);
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await gambar(id, sock);
};
