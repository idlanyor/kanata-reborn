import { readFileSync, writeFileSync } from 'fs';
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

const TOXIC_WORDS = ['anjing', 'bangsat', 'kontol', 'memek', 'jembut', 'ngentot', 'goblok', 'tolol', 'babi', 'monyet', 'lonte', 'bejat', 'keparat', 'biadab', 'bajingan', 'bacot', 'tai', 'jancok', 'perek', 'bencong', 'banci', 'fuck', 'shit', 'bitch', 'pussy', 'asshole', 'bastard'];
const WARNING_FILE = 'src/lib/database/toxic_warnings.json';

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
    const containsToxic = TOXIC_WORDS.some(word => lowercaseMsg.includes(word));
    
    if (containsToxic) {
        // Initialize or increment warning count
        warnings[sender] = (warnings[sender] || 0) + 1;
        writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));

        const warningCount = warnings[sender];
        let action = '';
        
        if (warningCount >= 5) {
            // Reset warnings after kick
            delete warnings[sender];
            writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));
            
            // Kick user
            await sock.groupParticipantsUpdate(id, [sender], "remove");
            action = '🚫 *Anda telah dikick dari grup karena mencapai 5 peringatan!*';
        } else {
            action = `⚠️ *Peringatan ${warningCount}/5*\nJika mencapai 5x akan dikick dari grup!`;
        }

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ANTI TOXIC* 」\n` +
                      `├ 👤 *User:* @${sender.split('@')[0]}\n` +
                      `├ ⚠️ *Pesan:* ${psn}\n` +
                      `├ 📊 *Warning:* ${warningCount}/5\n` +
                      `├ ${action}\n` +
                      `╰──────────────────`,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Anti-Toxic',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: '⚠️ Anti-Toxic Warning',
                        body: 'Keep the chat clean!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        
        // Delete toxic message
        await sock.sendMessage(id, { delete: m.key });
    }
}; 