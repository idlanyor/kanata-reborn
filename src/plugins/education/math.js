import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = "math";
export const description = "🔢 Kalkulator dengan langkah penyelesaian";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: `🔢 Kirim soal matematika yang mau diselesaikan!

Contoh: 
*.math 2x + 5 = 15*
*.math integrate x^2 dx*
*.math solve 3x^2 - 6x + 2 = 0*`
        });
        return;
    }

    try {
        const prompt = `Tolong selesaikan soal matematika ini dengan langkah-langkah yang jelas:

Soal: ${psn}

Format jawaban:
📝 Soal: [tulis ulang soal]
🔍 Langkah penyelesaian:
1. [langkah 1]
2. [langkah 2]
dst.
✨ Jawaban akhir: [hasil]`;
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini2);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.1 // Lebih presisi untuk matematika
            }
        });

        const result = await model.generateContent(prompt);
        await sock.sendMessage(id, { text: result.response.text() });

    } catch (error) {
        console.error("Error in math solver:", error);
        await sock.sendMessage(id, {
            text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏"
        });
    }
}; 