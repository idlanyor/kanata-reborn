import { gpt4Hika } from "../../lib/ai.js";

// Metadata deskripsi perintah
export const description = "🤖 *AI GPT 3.5* disediakan oleh *SkizoTech*";
export const handler = "ai"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        sock.sendMessage(id, {
            text: "Gunakan prefix *ai*/tag bot untuk bertanya apa saja ke AI.\nContoh: _*ai siapa presiden Indonesia saat ini?*_\n\n📝 *Ajukan pertanyaanmu dan biarkan AI memberikan jawabannya!*",
            ai: true
        });
        return;
    }

    try {
        // Menampilkan respons AI yang diambil dari gptSkizo
        const text = await gpt4Hika({ prompt: psn, id });
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `AI-nya lagi mantenan guys,belum bisa dipake,xD` });
        // await sock.sendMessage(id, { text: `⚠️ *Ups, Terjadi kesalahan*:\n${error.message}` });
    }
};
