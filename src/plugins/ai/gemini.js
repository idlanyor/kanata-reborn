import { gemini } from "../../lib/ai.js";
export const description = "AI Gemini provided by *Google Inc*";
export const handler = "gemini"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *gemini* Tanyakan sesuatu kepada Gemini\n contoh : gemini siapa presiden indonesia saat ini"
        })
        return
    }
    await sock.sendMessage(id, { text: await gemini(psn) });
};
