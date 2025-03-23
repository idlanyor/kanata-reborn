import { tebak } from "../../helper/skizotech.js";
import { tebakSession } from "../../lib/tebak/index.js";
export const handler = "bendera"
export const description = "Tebak Bendera";
function countryToFlagEmoji(countryCode) {
    let code = countryCode.toUpperCase();

    if (code.length !== 2) {
        throw new Error('Kode negara kudu 2 huruf!');
    }


    // Konversi masing-masing karakter kode negara dadi emoji bendera
    let flag = String.fromCodePoint(code.charCodeAt(0) + 127397) +
        String.fromCodePoint(code.charCodeAt(1) + 127397);

    return flag;
}

export const bendera = async (id, sock) => {
    try {
        const response = await tebak('tebakbendera');
        const question = countryToFlagEmoji(response.data.flag);
        const answer = response.data.name;

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
    await bendera(id, sock);
};
