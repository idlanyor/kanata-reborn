import { neo } from "../../helper/neoxr.js";
import { tebakSession } from "../../lib/tebak/index.js";
export const description = "Mini Game Susun Kata";
export const handler = "susun"
const susun = async (id, sock) => {
    try {
        const response = await neo('whatword');
        const question = `Tipe : ${response.data.data.tipe}\n Pertanyaan : ${response.data.data.pertanyaan}`;
        const answer = response.data.data.jawaban;

        await sock.sendMessage(id, { text: question });

        tebakSession.set(id, {
            answer: answer,
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000) // 60 detik
        });
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await susun(id, sock);
};
