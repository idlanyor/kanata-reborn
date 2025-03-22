import { GoogleGenerativeAI } from "@google/generative-ai";
export const description = "🎨 *AI Image Generator* menggunakan Gemini";
export const handler = "aimage"

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "🖼️ Kasih deskripsi / query gambarnya dong bestie!\n\nContoh: *aimage pemandangan alam* atau *aimage sunset di pantai*"
        });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '🎨 Bentar ya bestie, gw lagi gambar nih... ⏳' });

        // Gunakan model Gemini untuk generate gambar
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
            generationConfig: {
                responseModalities: ['Text', 'Image']
            },
        });

        const response = await model.generateContent(psn);

        // Proses hasil generate
        for (const part of response.response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');

                // Kirim gambar ke WhatsApp
                await sock.sendMessage(id, {
                    image: buffer,
                    caption: `✨ Ini hasil gambar untuk query: _${psn}_\n\n_Generated by Gemini_`
                });
                return;
            }
        }
    } catch (error) {
        console.error("Error generating image:", error);
        await sock.sendMessage(id, {
            text: `⚠️ Waduh error nih bestie! Coba lagi ya:\n\n${error.message}`
        });
    }
};

