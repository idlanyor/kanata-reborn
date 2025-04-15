// import { game } from "../../helper/hikaru.js"
// import moment from 'moment';
// import { getRandomFlag } from "../../utils/flagData.js"

// export const handler = "tebakbendera"
// export const description = "Tebak Bendera";

// const bendera = async (id, sock) => {
//     try {
//         const response = getRandomFlag();
//         const caption = response.description;
//         const answer = response.answer.toLowerCase().trim();

//         console.log('New Game Session:', {
//             id: id,
//             answer: answer
//         });

//         await sock.sendMessage(id, { text: caption });

//         global.tebakGame[id] = {
//             session: true,
//             answer: answer,
//             timestamp: moment(),
//             timeout: setTimeout(async () => {
//                 await sock.sendMessage(id, {
//                     text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
//                 });
//                 delete global.tebakGame[id];
//             }, 60000)
//         };

//         console.log('Game state after creation:', global.tebakGame[id]);
//     } catch (error) {
//         console.log(error)
//         await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
//     }
// };

// export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
//     await bendera(id, sock);
// };
