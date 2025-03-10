import { asahotak } from "../../lib/tebak/index.js";
export const handler = "asahotak"
export const description = "Tebak tebakan Asah Otak";
// const asahotak = async (id, sock) => {
//     try {
//         const response = await tebak('asahotak');
//         const question = response.data.result.question;
//         const answer = response.data.result.answer;

//         await sock.sendMessage(id, { text: question });

//         tebakSession.set(id, {
//             answer: answer,
//             timeout: setTimeout(async () => {
//                 await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
//                 tebakSession.delete(id);
//             }, 60000) // 60 detik
//         });
//     } catch (error) {
//         console.log(error)
//         await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
//     }
// };
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await asahotak(id, sock);

};
