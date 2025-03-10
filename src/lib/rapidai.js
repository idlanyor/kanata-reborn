// import axios from 'axios';
// import config from '../globalThis.js';

// export async function chatgpt4(prompt) {
//     const options = {
//         method: 'POST',
//         url: 'https://chatgpt-42.p.rapidapi.com/gpt4',
//         headers: {
//             'x-rapidapi-key': globalThis.rapid.gpt4.key,
//             'x-rapidapi-host': globalThis.rapid.gpt4.host,
//             'Content-Type': 'application/json'
//         },
//         data: {
//             messages: [
//                 {
//                     role: 'system',
//                     content: 'selalu balas percakapan user dalam bahasa indonesia'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             web_access: true
//         }
//     };
//     try {
//         const response = await axios.request(options);
//         return response.data.result
//     } catch (error) {
//         throw error
//     }
// }
