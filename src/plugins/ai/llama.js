import { llamaGroq } from "../../lib/ai.js";
export const description = "AI GPT 3.5 provided by *Groq x Facebook Meta*";
export const handler = "llama"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, { text: "prefix *llama* Tanyakan sesuatu kepada Llama Meta AI \n contoh : llama siapa presiden indonesia saat ini" })
        return
    }
    await sock.sendMessage(id, { text: await llamaGroq(psn) });
};
