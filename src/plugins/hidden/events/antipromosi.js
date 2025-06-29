import { readFileSync, writeFileSync } from 'fs';
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


const PROMO_PATTERNS = [
    'join grup',
    'open member',
    'open slot',
    'join sekarang',
    'wa.me/',
    'whatsapp.com/group',
    'member gratis',
    'click link',
    'klik link',
    'masuk grup',
    'masuk group',
    'jual followers',
    'followers murah',
    'paid promote',
    'open endorse',
    'endorse murah',
    'promo murah',
    'bisnis modal',
    'modal kecil',
    'penghasilan tambahan',
    'cari uang',
    'gabung sekarang'
];

const WARNING_FILE = 'src/lib/database/promo_warnings.json';

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
    const containsPromo = PROMO_PATTERNS.some(pattern => lowercaseMsg.includes(pattern));
    
    if (containsPromo) {
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
            action = '🚫 *Anda telah dikick dari grup karena mencapai 3 peringatan promosi!*';
        } else {
            action = `⚠️ *Peringatan ${warningCount}/3*\nJika mencapai 3x akan dikick dari grup!`;
        }

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ANTI PROMOSI* 」\n` +
                      `├ 👤 *User:* @${sender.split('@')[0]}\n` +
                      `├ ⚠️ *Pesan:* ${psn}\n` +
                      `├ 📊 *Warning:* ${warningCount}/3\n` +
                      `├ ${action}\n` +
                      `├ \n` +
                      `├ *Note:* Dilarang promosi dalam\n` +
                      `├ bentuk apapun di grup ini!\n` +
                      `╰──────────────────`,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Anti-Promo',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: '⚠️ Anti-Promosi Warning',
                        body: 'No promotion allowed!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        
        // Delete promo message
        await sock.sendMessage(id, { delete: m.key });
    }
}; 