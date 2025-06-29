import User from '../../database/models/User.js';
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';


export default async ({ sock, m, id, noTel }) => {
    try {
        // Debug log
        console.log('Attempting daily claim for:', noTel)
        
        const result = await User.claimDaily(noTel)
        
        // Debug log
        console.log('Claim result:', result)

        if (result.error) {
            throw new Error(result.message)
        }
        
        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *DAILY REWARD* 」
├ ✨ *EXP Didapat:* +${result.dailyExp}
${result.levelUp ? `├ 🎉 *LEVEL UP!* ke level ${result.newLevel}!\n` : ''}
├ 📊 *Progress:*
├ Level: ${result.newLevel}
├ EXP: ${result.currentExp}/${result.expNeeded}
╰──────────────────

_Jangan lupa klaim lagi besok ya!_`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: '🎁 Daily Reward Claimed!',
                        body: `+${result.dailyExp} EXP Added`,
                        mediaType: 1,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                    }
                }
            }
        }), { userJid: id, quoted: m })

        await sock.relayMessage(id, message.message, { messageId: message.key.id })
        
        await sock.sendMessage(id, {
            react: {
                text: '🎁',
                key: m.key
            }
        })
    } catch (error) {
        // Debug log
        console.error('Daily claim error:', error)
        
        await sock.sendMessage(id, { 
            text: `❌ ${error.message || 'Terjadi kesalahan saat mengklaim daily reward'}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Daily Claim Failed',
                    body: 'Try again tomorrow',
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
                }
            }
        })
        
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        })
    }
}

export const handler = 'daily'; 