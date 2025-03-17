import fetch from 'node-fetch';

// Daftar bahasa yang didukung
const ISO_LANGUAGES = {
    'af': 'Afrikaans', 'sq': 'Albanian', 'am': 'Amharic', 'ar': 'Arabic',
    'hy': 'Armenian', 'az': 'Azerbaijani', 'eu': 'Basque', 'be': 'Belarusian',
    'bn': 'Bengali', 'bs': 'Bosnian', 'bg': 'Bulgarian', 'ca': 'Catalan',
    'ceb': 'Cebuano', 'ny': 'Chichewa', 'zh': 'Chinese', 'co': 'Corsican',
    'hr': 'Croatian', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch',
    'en': 'English', 'eo': 'Esperanto', 'et': 'Estonian', 'tl': 'Filipino',
    'fi': 'Finnish', 'fr': 'French', 'fy': 'Frisian', 'gl': 'Galician',
    'ka': 'Georgian', 'de': 'German', 'el': 'Greek', 'gu': 'Gujarati',
    'ht': 'Haitian Creole', 'ha': 'Hausa', 'haw': 'Hawaiian', 'iw': 'Hebrew',
    'hi': 'Hindi', 'hmn': 'Hmong', 'hu': 'Hungarian', 'is': 'Icelandic',
    'ig': 'Igbo', 'id': 'Indonesian', 'ga': 'Irish', 'it': 'Italian',
    'ja': 'Japanese', 'jw': 'Javanese', 'kn': 'Kannada', 'kk': 'Kazakh',
    'km': 'Khmer', 'ko': 'Korean', 'ku': 'Kurdish', 'ky': 'Kyrgyz',
    'lo': 'Lao', 'la': 'Latin', 'lv': 'Latvian', 'lt': 'Lithuanian',
    'lb': 'Luxembourgish', 'mk': 'Macedonian', 'mg': 'Malagasy', 'ms': 'Malay',
    'ml': 'Malayalam', 'mt': 'Maltese', 'mi': 'Maori', 'mr': 'Marathi',
    'mn': 'Mongolian', 'my': 'Myanmar', 'ne': 'Nepali', 'no': 'Norwegian',
    'ps': 'Pashto', 'fa': 'Persian', 'pl': 'Polish', 'pt': 'Portuguese',
    'pa': 'Punjabi', 'ro': 'Romanian', 'ru': 'Russian', 'sm': 'Samoan',
    'gd': 'Scots Gaelic', 'sr': 'Serbian', 'st': 'Sesotho', 'sn': 'Shona',
    'sd': 'Sindhi', 'si': 'Sinhala', 'sk': 'Slovak', 'sl': 'Slovenian',
    'so': 'Somali', 'es': 'Spanish', 'su': 'Sundanese', 'sw': 'Swahili',
    'sv': 'Swedish', 'tg': 'Tajik', 'ta': 'Tamil', 'te': 'Telugu',
    'th': 'Thai', 'tr': 'Turkish', 'uk': 'Ukrainian', 'ur': 'Urdu',
    'uz': 'Uzbek', 'vi': 'Vietnamese', 'cy': 'Welsh', 'xh': 'Xhosa',
    'yi': 'Yiddish', 'yo': 'Yoruba', 'zu': 'Zulu'
};

// Bahasa dengan aksara non-latin
const NON_LATIN_SCRIPTS = [
    'ar', 'bn', 'zh', 'gu', 'iw', 'hi', 'ja', 'kn', 'km', 'ko',
    'ml', 'mr', 'my', 'ne', 'pa', 'ru', 'sd', 'si', 'ta', 'te',
    'th', 'ur'
];

async function detectLanguage(text) {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        return data[2] || 'auto';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'auto';
    }
}

async function translate(text, targetLang = 'id', sourceLang = 'auto') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();

        let translatedText = '';
        data[0].forEach(item => {
            if (item[0]) translatedText += item[0];
        });

        // Get transliteration for non-latin scripts
        let transliteration = '';
        if (NON_LATIN_SCRIPTS.includes(targetLang)) {
            const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${targetLang}&tl=en&dt=t&dt=rm&q=${encodeURIComponent(translatedText)}`;
            const transResponse = await fetch(transUrl);
            const transData = await transResponse.json();

            if (transData[1] && transData[1][0] && transData[1][0][1]) {
                transliteration = transData[1][0][1];
            }
        }

        return {
            text: translatedText,
            transliteration,
            from: ISO_LANGUAGES[data[2]] || 'Unknown',
            to: ISO_LANGUAGES[targetLang] || 'Unknown'
        };
    } catch (error) {
        throw new Error(`Translation failed: ${error.message}`);
    }
}

export const description = "✨ Translate teks ke berbagai bahasa. Bisa pake command atau ngomong langsung ke gw!";
export const handler = ['tr', 'tl', 'translate'];

export default async ({ sock, m, id, psn, cmd }) => {
    try {
        let text, targetLang = 'id';
        const args = psn.split(' ');

        // Cek kode bahasa di args pertama
        if (args[0] && ISO_LANGUAGES[args[0].toLowerCase()]) {
            targetLang = args[0].toLowerCase();
            text = args.slice(1).join(' ');
        } else {
            text = args.join(' ');
        }

        // Cek reply message
        if (!text && m.quoted) {
            text = m.quoted.text || m.quoted.message?.conversation || '';
        }

        // Tampilkan bantuan jika tidak ada teks
        if (!text) {
            let helpText = `🌐 *TRANSLATOR*\n\n`;
            helpText += `Cara pake:\n`;
            helpText += `1. !tr <kode_bahasa> <teks>\n`;
            helpText += `2. Reply pesan dengan !tr <kode_bahasa>\n`;
            helpText += `3. Ngomong langsung: "Tolong translatein ke jepang: selamat pagi"\n\n`;
            helpText += `Contoh:\n`;
            helpText += `- !tr en Selamat pagi\n`;
            helpText += `- !tr ja Good morning\n`;
            helpText += `- Translate ke korea: Aku suka kamu\n\n`;
            helpText += `Daftar kode bahasa:\n`;

            // Tampilkan 10 bahasa populer dulu
            const popularLangs = {
                'en': 'English', 'id': 'Indonesian', 'ja': 'Japanese',
                'ko': 'Korean', 'ar': 'Arabic', 'es': 'Spanish',
                'fr': 'French', 'de': 'German', 'it': 'Italian',
                'zh': 'Chinese'
            };
            
            Object.entries(popularLangs).forEach(([code, lang]) => {
                helpText += `${code} = ${lang}\n`;
            });
            
            helpText += `\nKetik !tr list untuk liat semua bahasa yang didukung`;

            await sock.sendMessage(id, { text: helpText });
            return;
        }

        // Tampilkan semua bahasa jika command tr list
        if (text.toLowerCase() === 'list') {
            let langList = `🌐 *DAFTAR BAHASA*\n\n`;
            Object.entries(ISO_LANGUAGES).forEach(([code, lang]) => {
                langList += `${code} = ${lang}\n`;
            });
            
            await sock.sendMessage(id, { text: langList });
            return;
        }

        // Reaksi proses
        await sock.sendMessage(id, {
            react: { text: '⏳', key: m.key }
        });

        // Deteksi bahasa sumber
        const sourceLang = await detectLanguage(text);

        // Terjemahkan
        const result = await translate(text, targetLang, sourceLang);

        // Format pesan hasil
        let response = `🌐 *TRANSLATE*\n\n` +
            `*Dari:* ${result.from}\n` +
            `*Ke:* ${result.to}\n\n` +
            `*Teks Asli:*\n${text}\n\n` +
            `*Terjemahan:*\n${result.text}`;

        // Tambah transliterasi untuk aksara non-latin
        if (NON_LATIN_SCRIPTS.includes(targetLang) && result.transliteration) {
            response += `\n\n*Cara Baca:*\n${result.transliteration}`;
        }

        await sock.sendMessage(id, { text: response });

        // Reaksi sukses
        await sock.sendMessage(id, {
            react: { text: '✅', key: m.key }
        });

    } catch (error) {
        console.error('Error in translate:', error);
        await sock.sendMessage(id, { 
            text: `❌ Waduh error nih bestie: ${error.message}` 
        });

        // Reaksi error
        await sock.sendMessage(id, {
            react: { text: '❌', key: m.key }
        });
    }
}; 