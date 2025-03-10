import { llamaGroq } from "../../lib/ai.js";
export const description = "AI Mixtral provided by *Groq x Mixtral*";
export const handler = "mistral"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *mistral* Tanyakan sesuatu kepada Mistral\n contoh : mistral siapa presiden indonesia saat ini"
        })
        return
    }
    await sock.sendMessage(id, { text: await llamaGroq(psn) });
};
