import { readFileSync, writeFileSync } from 'fs';
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

const SPAM_INTERVAL = 3000; // 3 detik
const SPAM_LIMIT = 5; // Jumlah pesan maksimal dalam interval
const WARNING_FILE = 'src/lib/database/spam_warnings.json';

// Track pesan user
const userMessages = new Map();
// Load existing warnings
let warnings = {};

try {
    warnings = JSON.parse(readFileSync(WARNING_FILE, 'utf8'));
} catch (error) {
    writeFileSync(WARNING_FILE, '{}', 'utf8');
}

export default async ({ sock, m, id, psn, sender }) => {
    const now = Date.now();
    
    if (!userMessages.has(sender)) {
        userMessages.set(sender, {
            timestamps: [now],
            count: 1
        });
        return;
    }

    const userData = userMessages.get(sender);
    userData.timestamps = userData.timestamps.filter(time => now - time < SPAM_INTERVAL);
    userData.timestamps.push(now);
    userData.count = userData.timestamps.length;

    if (userData.count > SPAM_LIMIT) {
        // Reset spam counter
        userMessages.delete(sender);
        
        // Increment warning
        warnings[sender] = (warnings[sender] || 0) + 1;
        writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));

        const warningCount = warnings[sender];
        let action = '';
        
        if (warningCount >= 3) {
            delete warnings[sender];
            writeFileSync(WARNING_FILE, JSON.stringify(warnings, null, 2));
            await sock.groupParticipantsUpdate(id, [sender], "remove");
            action = '🚫 *Anda telah dikick dari grup karena mencapai 3 peringatan spam!*';
        } else {
            action = `⚠️ *Peringatan ${warningCount}/3*\nJika mencapai 3x akan dikick dari grup!`;
        }

        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *ANTI SPAM* 」\n` +
                      `├ 👤 *User:* @${sender.split('@')[0]}\n` +
                      `├ ⚠️ *Spam Count:* ${userData.count} pesan/${SPAM_INTERVAL/1000}s\n` +
                      `├ 📊 *Warning:* ${warningCount}/3\n` +
                      `├ ${action}\n` +
                      `├ \n` +
                      `├ *Note:* Jangan spam dalam grup!\n` +
                      `├ Max ${SPAM_LIMIT} pesan/${SPAM_INTERVAL/1000}s\n` +
                      `╰──────────────────`,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305152329358@newsletter',
                        newsletterName: 'Kanata Anti-Spam',
                        serverMessageId: -1
                    },
                    externalAdReply: {
                        title: '⚠️ Anti-Spam Warning',
                        body: 'No spamming allowed!',
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        }), { userJid: id });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        
        // Delete spam messages
        await sock.sendMessage(id, { delete: m.key });
    }
}; 