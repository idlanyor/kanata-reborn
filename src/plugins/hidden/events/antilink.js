import { readFileSync, writeFileSync } from 'fs';
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

const LINK_PATTERNS = [
    'http://',
    'https://',
    'wa.me',
    'whatsapp.com', 
    't.me',
    'discord.gg',
    'chat.whatsapp.com'
];

// Link yang diperbolehkan
const ALLOWED_LINKS = [
    'facebook.com',
    'fb.com',
    'tiktok.com',
    'youtube.com',
    'youtu.be',
    'instagram.com',
    'threads.net',
    'snackvideo.com',
    'spotify.com',
    'pddikti.kemdikbud.go.id',
    'xiaohongshu.com'
];

const WARNING_FILE = 'src/lib/database/link_warnings.json';

// Load existing warnings
let warnings = {};
try {
    warnings = JSON.parse(readFileSync(WARNING_FILE, 'utf8'));
} catch (error) {
    writeFileSync(WARNING_FILE, '{}', 'utf8');
}

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) return;
    
    const lowercaseMsg = psn.toLowerCase();
    
    // Cek apakah pesan mengandung link yang dilarang
    const containsLink = LINK_PATTERNS.some(pattern => lowercaseMsg.includes(pattern));
    
    // Cek apakah pesan mengandung link yang diperbolehkan
    const containsAllowedLink = ALLOWED_LINKS.some(pattern => lowercaseMsg.includes(pattern));
    
    // Jika mengandung link yang dilarang dan bukan link yang diperbolehkan
    if (containsLink && !containsAllowedLink) {
        // Initialize or increment warning count
        warnings[sender] = (warnings[sender] || 0) + 1;
        writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));

        const warningCount = warnings[sender];
        let action = '';
        
        if (warningCount >= 3) {
            // Reset warnings after kick
            delete warnings[sender];
            writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));
            
            // Kick user
            await sock.groupParticipantsUpdate(id, [sender], "remove");
            action = '🚫 *Anda telah dikick dari grup karena mencapai 3 peringatan link!*';
        } else {
            action = `⚠️ *Peringatan ${warningCount}/3*\nJika mencapai 3x akan dikick dari grup!`;
        }

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ANTI LINK* 」\n` +
                      `├ 👤 *User:* @${sender.split('@')[0]}\n` +
                      `├ ⚠️ *Pesan:* ${psn}\n` +
                      `├ 📊 *Warning:* ${warningCount}/3\n` +
                      `├ ${action}\n` +
                      `├ \n` +
                      `├ *Note:* Dilarang mengirim link\n` +
                      `├ kecuali link download yang diizinkan!\n` +
                      `╰──────────────────`,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Anti-Link',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: '⚠️ Anti-Link Warning',
                        body: 'No links allowed!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        
        // Delete message containing link
        await sock.sendMessage(id, { delete: m.key });
    }
}; 