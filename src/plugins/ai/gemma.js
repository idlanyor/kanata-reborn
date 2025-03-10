import { gemmaGroq } from "../../lib/ai.js";
export const description = "AI Gemma provided by *Groq x Google*";
export const handler = "gemma"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, { text: "prefix *gemma* Tanyakan sesuatu kepada Gemma\n contoh : gemma siapa presiden indonesia saat ini" })
        return
    }
    await sock.sendMessage(id, { text: await gemmaGroq(psn) });
};
