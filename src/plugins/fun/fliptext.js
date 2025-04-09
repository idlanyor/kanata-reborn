const flipTable = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ',
    'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
    'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o',
    'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
    'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ',
    'z': 'z', 'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D',
    'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I',
    'J': 'ſ', 'K': 'K', 'L': '˥', 'M': 'W', 'N': 'N',
    'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'R', 'S': 'S',
    'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
    'Y': '⅄', 'Z': 'Z', '0': '0', '1': 'Ɩ', '2': 'ᄅ',
    '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
    '8': '8', '9': '6', ',': "'", '.': '˙', '?': '¿',
    '!': '¡', '"': '„', "'": ',', '`': ',', '(': ')',
    ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
    '<': '>', '>': '<', '&': '⅋', '_': '‾', '∴': '∵',
    '⁅': '⁆', '∴': '∵'
};

const emojiMap = {
    'a': '👽', 'b': '👾', 'c': '👻', 'd': '💀', 'e': '👻',
    'f': '🎃', 'g': '👽', 'h': '👾', 'i': '👻', 'j': '💀',
    'k': '🎃', 'l': '👽', 'm': '👾', 'n': '👻', 'o': '💀',
    'p': '🎃', 'q': '👽', 'r': '👾', 's': '👻', 't': '💀',
    'u': '🎃', 'v': '👽', 'w': '👾', 'x': '👻', 'y': '💀',
    'z': '🎃', ' ': '🌟'
};

const alienLanguage = {
    'a': 'α', 'b': 'β', 'c': 'ς', 'd': 'δ', 'e': 'ε',
    'f': 'φ', 'g': 'γ', 'h': 'η', 'i': 'ι', 'j': 'ϊ',
    'k': 'κ', 'l': 'λ', 'm': 'μ', 'n': 'η', 'o': 'σ',
    'p': 'ρ', 'q': 'q', 'r': 'г', 's': 'ѕ', 't': 'τ',
    'u': 'υ', 'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'γ',
    'z': 'ζ'
};

export const handler = 'flip'
export const description = 'Mengubah teks menjadi terbalik/emoji/alien'

const helpText = `⚡ *CHAT SEBALIKNYA* ⚡

*1. Teks Terbalik*
▸ .flip text <teks>
  Contoh: .flip text halo bot

*2. Teks Emoji*
▸ .flip emoji <teks>
  Contoh: .flip emoji hai

*3. Bahasa Alien*
▸ .flip alien <teks>
  Contoh: .flip alien hello

_Powered by Kanata-V3_`;

function flipText(text) {
    return text.split('').map(char => flipTable[char] || char).reverse().join('');
}

function emojiText(text) {
    return text.toLowerCase().split('').map(char => emojiMap[char] || char).join('');
}

function alienText(text) {
    return text.toLowerCase().split('').map(char => alienLanguage[char] || char).join('');
}

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Flip Text 乂',
                    body: 'Text Transformer',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    try {
        const [mode, ...textParts] = psn.split(' ');
        const text = textParts.join(' ');

        if (!text) {
            throw new Error('Teks tidak boleh kosong!');
        }

        let result;
        let modeText;

        switch (mode.toLowerCase()) {
            case 'text':
                result = flipText(text);
                modeText = 'Teks Terbalik';
                break;
            case 'emoji':
                result = emojiText(text);
                modeText = 'Teks Emoji';
                break;
            case 'alien':
                result = alienText(text);
                modeText = 'Bahasa Alien';
                break;
            default:
                throw new Error('Mode tidak valid! Gunakan: text, emoji, atau alien');
        }

        const message = `╭─「 *${modeText}* 」
├ *Input:* ${text}
├ *Result:* ${result}
╰──────────────────

_Powered by Kanata-V3_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 Flip Text 乂',
                    body: 'Text Transformer',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '🔄',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Error: ' + error.message + '\n\nGunakan .flip untuk melihat panduan penggunaan.',
            contextInfo: {
                externalAdReply: {
                    title: '❌ Flip Failed',
                    body: 'An error occurred while flipping text',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
}; 