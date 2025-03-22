export const handler = "grammar";
export const description = "✍️ Perbaiki grammar dan tata bahasa";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: "✍️ Kirim teks yang mau dicek grammarnya!\n\nContoh: *.grammar I am go to school yesterday*"
        });
        return;
    }

    try {
        const prompt = `Tolong periksa dan perbaiki grammar dari teks ini. Berikan:
1. Teks yang sudah diperbaiki
2. Penjelasan kesalahan
3. Saran perbaikan

Teks: "${psn}"`;

        const model = globalThis.genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite"
        });

        const result = await model.generateContent(prompt);
        await sock.sendMessage(id, { text: result.response.text() });

    } catch (error) {
        console.error("Error in grammar check:", error);
        await sock.sendMessage(id, { 
            text: "⚠️ Waduh error nih bestie! Coba lagi ntar ya? 🙏" 
        });
    }
}; 