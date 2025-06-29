import { readFileSync, writeFileSync } from 'fs';
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


const WARNING_FILE = 'src/lib/database/virtex_warnings.json';

// Patterns untuk mendeteksi virtex
const VIRTEX_PATTERNS = [
    /[\u0800-\uFFFF]{2000,}/,  // Karakter unicode berlebihan
    /(.)\1{250,}/,             // Karakter berulang
    /^(?=.*[A-Za-z0-9]){1000,}/, // Teks sangat panjang
    /[\u200B-\u200D\uFEFF]/,  // Zero-width characters
    /[🏃‍♂️]{100,}/           // Emoji berulang
];

let warnings = {};
try {
    warnings = JSON.parse(readFileSync(WARNING_FILE, 'utf8'));
} catch (error) {
    writeFileSync(WARNING_FILE, '{}', 'utf8');
}

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) return;
    
    const isVirtex = VIRTEX_PATTERNS.some(pattern => pattern.test(psn));
    
    if (isVirtex) {
        warnings[sender] = (warnings[sender] || 0) + 1;
        writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));

        const warningCount = warnings[sender];
        
        // Instant kick for virtex
        delete warnings[sender];
        writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));
        await sock.groupParticipantsUpdate(id, [sender], "remove");

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ANTI VIRTEX* 」\n` +
                      `├ 👤 *User:* @${sender.split('@')[0]}\n` +
                      `├ ⚠️ *Virtex Detected!*\n` +
                      `├ 🚫 *Auto Kick Activated*\n` +
                      `├ \n` +
                      `├ *Note:* Dilarang mengirim virtex/virus!\n` +
                      `╰──────────────────`,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Security',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: '⚠️ Security Alert',
                        body: 'Virtex Detected!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        await sock.sendMessage(id, { delete: m.key });
    }
}; 