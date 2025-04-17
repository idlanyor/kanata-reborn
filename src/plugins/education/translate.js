
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = "tr";
export const description = "🌐 Translator multi bahasa\n*.tr [kode_bahasa] [teks]*\n*.tr id Hello World*";

const languageCodes = {
    'af': 'Afrikaans',
    'sq': 'Albania',
    'am': 'Amharik',
    'ar': 'Arab',
    'hy': 'Armenia',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusia',
    'bn': 'Bengali',
    'bs': 'Bosnia',
    'bg': 'Bulgaria',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'zh': 'Mandarin (Cina)',
    'co': 'Korsika',
    'hr': 'Kroasia',
    'cs': 'Ceko',
    'da': 'Denmark',
    'nl': 'Belanda',
    'en': 'Inggris',
    'eo': 'Esperanto',
    'et': 'Estonia',
    'fi': 'Finlandia',
    'fr': 'Perancis',
    'fy': 'Frisia',
    'gl': 'Galicia',
    'ka': 'Georgia',
    'de': 'Jerman',
    'el': 'Yunani',
    'gu': 'Gujarati',
    'ht': 'Kreol Haiti',
    'ha': 'Hausa',
    'haw': 'Hawaii',
    'he': 'Ibrani',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungaria',
    'is': 'Islandia',
    'ig': 'Igbo',
    'id': 'Indonesia',
    'ga': 'Irlandia',
    'it': 'Italia',
    'ja': 'Jepang',
    'jw': 'Jawa',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'rw': 'Kinyarwanda',
    'ko': 'Korea',
    'ku': 'Kurdi (Kurmanji)',
    'ky': 'Kirgiz',
    'lo': 'Laos',
    'la': 'Latin',
    'lv': 'Latvia',
    'lt': 'Lituania',
    'lb': 'Luksemburg',
    'mk': 'Makedonia',
    'mg': 'Malagasi',
    'ms': 'Melayu',
    'ml': 'Malayalam',
    'mt': 'Malta',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolia',
    'my': 'Myanmar (Burma)',
    'ne': 'Nepali',
    'no': 'Norwegia',
    'ny': 'Nyanja (Chichewa)',
    'or': 'Odia (Oriya)',
    'ps': 'Pashto',
    'fa': 'Persia',
    'pl': 'Polandia',
    'pt': 'Portugis',
    'pa': 'Punjabi',
    'ro': 'Rumania',
    'ru': 'Rusia',
    'sm': 'Samoa',
    'gd': 'Skotlandia Gaelic',
    'sr': 'Serbia',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'sk': 'Slovakia',
    'sl': 'Slovenia',
    'so': 'Somali',
    'es': 'Spanyol',
    'su': 'Sunda',
    'sw': 'Swahili',
    'sv': 'Swedia',
    'tl': 'Tagalog (Filipina)',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'tt': 'Tatar',
    'te': 'Telugu',
    'th': 'Thailand',
    'tr': 'Turki',
    'tk': 'Turkmen',
    'uk': 'Ukraina',
    'ur': 'Urdu',
    'ug': 'Uighur',
    'uz': 'Uzbek',
    'vi': 'Vietnam',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
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
            throw new Error('Invalid format or language code ');
        }

        const prompt = `Translate this text to ${languageCodes[targetLang]}:
"${text}"

Please provide:
1. Original text
2. Translation
3. Pronunciation (if applicable)`;
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini2);
        const model = genAI.getGenerativeModel({
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