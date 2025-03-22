export const handler = "summary";
export const description = "📝 Rangkum teks panjang jadi singkat dan padat";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: "📝 Kirim teks yang mau dirangkum!\n\nContoh: *.summary [teks panjang]*"
        });
        return;
    }

    try {
        const prompt = `Tolong rangkum teks ini dalam poin-poin penting (maksimal 5 poin):

${psn}

Format output:
📌 Rangkuman:
• [poin 1]
• [poin 2]
dst.

💡 Kata Kunci: [kata kunci penting]`;

        const model = globalThis.genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.3,
                topK: 20,
                topP: 0.8
            }
        });

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        await sock.sendMessage(id, { text: summary });

    } catch (error) {
        console.error("Error in summary:", error);
        await sock.sendMessage(id, { 
            text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏" 
        });
    }
}; 