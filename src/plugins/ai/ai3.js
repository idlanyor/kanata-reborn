import { ryzen } from "../../helper/ryzen.js";

export const handler = 'ai3'
export const description = "AI GPT-4o-mini with Web Access provided by *RyzenAI*";
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *ai3* Tanyakan sesuatu kepada AI GPT-4o-mini\n contoh : ai3 siapa presiden indonesia saat ini"

        })
        return
    }
    try {
        const ai = await ryzen('ai/v2/chatgpt', {
            params: {
                text: psn,
                prompt: 'Kamu adalah KanataBot yang sering marah dan suka toxic, kamu di ciptakan oleh @62895395590009 biasa dipanggil Roy, ingat kamu setiap jawab pertanyaan kamu pakai bahasa yang kasar dan penuh bercandaan, jawab setiap pertanyaan sertakan emoji ingat itu'
            }
        })
        await sock.sendMessage(id, { text: ai.data.response });
    } catch (error) {
        console.log(error);
        await sock.sendMessage(id, { text: `Terjadi kesalahan di sisi server ${error}` });
    }
};
