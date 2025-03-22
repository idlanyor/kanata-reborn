export const handler = "tr";
export const description = "🌐 Translator multi bahasa\n*.tr [kode_bahasa] [teks]*\n*.tr id Hello World*";

const languageCodes = {
    'id': 'Indonesia',
    'en': 'Inggris',
    'ja': 'Jepang',
    'ar': 'Arab',
    'ko': 'Korea',
    // ... tambahkan kode bahasa lainnya
};

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: `🌐 Format: *.tr [kode_bahasa] [teks]*

Contoh:
*.tr id Hello World*
*.tr en Apa kabar*
*.tr ja Good morning*

Kode bahasa:
${Object.entries(languageCodes).map(([code, lang]) => `${code} = ${lang}`).join('\n')}`
        });
        return;
    }

    try {
        const [targetLang, ...textParts] = psn.split(' ');
        const text = textParts.join(' ');

        if (!text || !languageCodes[targetLang]) {
            throw new Error('Invalid format or language code');
        }

        const prompt = `Translate this text to ${languageCodes[targetLang]}:
"${text}"

Please provide:
1. Original text
2. Translation
3. Pronunciation (if applicable)`;

        const model = globalThis.genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite"
        });

        const result = await model.generateContent(prompt);
        await sock.sendMessage(id, { text: result.response.text() });

    } catch (error) {
        console.error("Error in translation:", error);
        await sock.sendMessage(id, { 
            text: "⚠️ Format salah atau bahasa tidak didukung! Coba *.tr* untuk bantuan." 
        });
    }
}; 