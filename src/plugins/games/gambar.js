import { tebak } from "../../helper/skizotech.js";
import { tebakSession } from "../../lib/tebak/index.js";
export const handler = "tebakgambar"
export const description = "Tebak Gambar";

const gambar = async (id, sock) => {
    try {
        const response = await tebak('tebakgambar');
        const img = response.data.img;
        const answer = response.data.jwb;
        await sock.sendMessage(id, { image: { url: img } })

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
    await gambar(id, sock);
};
