import flip from 'flip-text';
import figlet from 'figlet';
import { promisify } from 'util';

const figletAsync = promisify(figlet);

export const handler = "textart";
export const description = "Text Art Converter";

// Fungsi stylish text
function styleText(text) {
    const styles = {
        // Font styles
        bold: '𝗧𝗲𝘅𝘁',
        italic: '𝘛𝘦𝘹𝘵',
        script: '𝓣𝓮𝔁𝓽',
        monospace: '𝚃𝚎𝚡𝚝',
        strikethrough: 'T̶e̶x̶t̶',
        circled: 'Ⓣⓔⓧⓣ',
        
        // Special styles
        vaporwave: 'Ｔｅｘｔ',
        tiny: 'ᵀᵉˣᵗ',
        mirror: 'txɘT'
    };
    
    const results = {};
    
    // Bold
    results.bold = text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const code = char.charCodeAt(0);
            const offset = code >= 97 ? 97 : 65;
            return String.fromCharCode(0x1D5E9 + (code - offset));
        }
        return char;
    }).join('');
    
    // Italic
    results.italic = text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(0x1D434 + (code - 65));
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(0x1D44E + (code - 97));
            }
        }
        return char;
    }).join('');
    
    // Script
    results.script = text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(0x1D49C + (code - 65));
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(0x1D4B6 + (code - 97));
            }
        }
        return char;
    }).join('');
    
    // Monospace
    results.monospace = text.split('').map(char => {
        if (/[a-zA-Z0-9]/.test(char)) {
            if (char >= 'a' && char <= 'z') {
                return String.fromCharCode(char.charCodeAt(0) + 0x1D68A - 97);
            } else if (char >= 'A' && char <= 'Z') {
                return String.fromCharCode(char.charCodeAt(0) + 0x1D670 - 65);
            } else if (char >= '0' && char <= '9') {
                return String.fromCharCode(char.charCodeAt(0) + 0x1D7F6 - 48);
            }
        }
        return char;
    }).join('');
    
    // Strikethrough
    results.strikethrough = text.split('').map(char => {
        return char + '\u0336';
    }).join('');
    
    // Circled
    results.circled = text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(0x24B6 + (code - 65));
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(0x24D0 + (code - 97));
            }
        } else if (/[0-9]/.test(char)) {
            return String.fromCharCode(0x2460 + parseInt(char) - 1);
        }
        return char;
    }).join('');
    
    // Vaporwave / fullwidth
    results.vaporwave = text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 33 && code <= 126) {
            return String.fromCharCode(code + 0xFEE0);
        }
        return char;
    }).join('');
    
    // Tiny
    results.tiny = text.split('').map(char => {
        const tinyMap = {
            'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ',
            'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᵠ', 'r': 'ʳ',
            's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
            'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ', 'F': 'ᶠ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ',
            'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'Q': 'ᵠ', 'R': 'ᴿ',
            'S': 'ˢ', 'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ', 'Z': 'ᶻ'
        };
        return tinyMap[char] || char;
    }).join('');
    
    // Mirror
    results.mirror = flip(text);
    
    return results;
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('🎭 *Text Art Converter*\n\nPilih gaya:\n*.textart style <teks>* - Lihat berbagai gaya teks\n*.textart ascii <teks>* - ASCII art\n*.textart binary <teks>* - Konversi ke biner');
        return;
    }
    
    try {
        const [cmd, ...textParts] = psn.split(' ');
        const text = textParts.join(' ');
        
        if (!text) {
            await m.reply('❌ Masukkan teks untuk dikonversi!');
            return;
        }
        
        await m.react('⏳');
        
        if (cmd.toLowerCase() === 'style') {
            const styles = styleText(text);
            
            let result = '✨ *Text Style Converter*\n\n';
            result += `*Normal:* ${text}\n\n`;
            
            for (const [styleName, styledText] of Object.entries(styles)) {
                result += `*${styleName.charAt(0).toUpperCase() + styleName.slice(1)}:* ${styledText}\n\n`;
            }
            
            await sock.sendMessage(id, { text: result }, { quoted: m });
        }
        else if (cmd.toLowerCase() === 'ascii') {
            if (text.length > 15) {
                await m.reply('⚠️ Teks terlalu panjang untuk ASCII art! Maksimal 15 karakter.');
                return;
            }
            
            const asciiArt = await figletAsync(text);
            await sock.sendMessage(id, { 
                text: `✨ *ASCII Art*\n\n\`\`\`\n${asciiArt}\n\`\`\``
            }, { quoted: m });
        }
        else if (cmd.toLowerCase() === 'binary') {
            const binary = text.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');
            
            await sock.sendMessage(id, { 
                text: `✨ *Binary Converter*\n\n*Text:* ${text}\n\n*Binary:*\n${binary}`
            }, { quoted: m });
        }
        else {
            await m.reply('❓ Perintah tidak dikenal. Gunakan:\n*.textart style <teks>*\n*.textart ascii <teks>*\n*.textart binary <teks>*');
        }
        
        await m.react('✨');
    } catch (error) {
        console.error('Error converting text:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses teks');
        await m.react('❌');
    }
};

export const help = {
    name: "textart",
    description: "Konversi teks ke berbagai gaya",
    usage: ".textart [style/ascii/binary] <teks>",
    example: ".textart style Hello World\n.textart ascii COOL\n.textart binary ABC"
}; 