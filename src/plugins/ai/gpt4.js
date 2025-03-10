import { chatgpt4 } from "../../lib/ai.js";
export const description = "AI GPT 3.5 with Web Access provided by *RapidAI*";
export const handler = "gptweb"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, { text: "prefix *gpt* Tanyakan sesuatu kepada GPT-WebAccess\n contoh : gpt siapa presiden indonesia saat ini" })
        return
    }
    await sock.sendMessage(id, { text: `_pertanyaan (${psn}) telah diterima dan sedang diproses_` })
    await sock.sendMessage(id, { text: await chatgpt4(psn) });
};
