import { ryzen } from "../../helper/ryzen.js";
export const description = "AI Claude 3 Haiku Anthropic provided by *RyzenAI*";
export const handler = "ai2"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *ai2* Tanyakan sesuatu kepada AI 2\n contoh : ai2 siapa presiden indonesia saat ini"

        })
        return
    }
    let text = await ryzen('ai/claude', {
        params: {
            text: psn
        }
    })
    await sock.sendMessage(id, {
        text: text.data.response,
        ai: true
    });
    // await sock.sendMessage(id, { text: `AI-nya lagi mantenan guys,belum bisa dipake,xD` });

};
