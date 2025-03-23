import figlet from 'figlet';
import { promisify } from 'util';

const figletAsync = promisify(figlet);

export const handler = "ascii";
export const description = "ASCII Art Generator";

// Daftar font tersedia
const popularFonts = [
    "Standard", "3D-ASCII", "ANSI Shadow", "Banner3", "Big", "Bloody", 
    "Doom", "Elite", "Graffiti", "Impossible", "Isometric1", "Shadow", 
    "Slant", "Small", "Sub-Zero", "Univers"
];

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        let fontList = '';
        popularFonts.forEach((font, index) => {
            fontList += `${index + 1}. ${font}\n`;
        });
        await m.reply(`🎨 *ASCII Art Generator*\n\nFormat: .ascii <teks> | [nomor font]\n\nFont tersedia:\n${fontList}`);
        return;
    }
    
    try {
        const [text, fontInput = "1"] = psn.split('|').map(part => part.trim());
        
        if (!text) {
            await m.reply('❌ Masukkan teks untuk dikonversi!');
            return;
        }
        
        await m.react('⏳');
        
        // Cek panjang teks
        if (text.length > 15) {
            await m.reply('⚠️ Teks terlalu panjang! Maksimal 15 karakter untuk hasil terbaik.');
        }
        
        // Tentukan font berdasarkan nomor
        let fontName = "Standard";
        const fontNumber = parseInt(fontInput);
        
        if (!isNaN(fontNumber) && fontNumber >= 1 && fontNumber <= popularFonts.length) {
            fontName = popularFonts[fontNumber - 1];
        }
        
        // Generate ASCII art
        const asciiArt = await figletAsync(text, { font: fontName });
        
        // Wrap dalam code block untuk tampilan yang baik
        const formattedArt = '```\n' + asciiArt + '\n```';
        
        await sock.sendMessage(id, { 
            text: `✨ *ASCII Art Generator*\n\n${formattedArt}\n\n*Font: ${fontName}*`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error creating ASCII art:', error);
        await m.reply(`❌ Terjadi kesalahan: ${error.message || 'Font tidak tersedia'}`);
        await m.react('❌');
    }
};

export const help = {
    name: "ascii",
    description: "Konversi teks menjadi ASCII art",
    usage: ".ascii <teks> | [nomor font]",
    example: ".ascii KANATA | 5"
}; 