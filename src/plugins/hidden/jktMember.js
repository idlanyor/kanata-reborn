/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : JKT 48 Official Site Scraper
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */
import pkg, { generateWAMessageFromContent } from '@fizzxydev/baileys-pro';
const { proto, prepareWAMessageMedia } = pkg
import { memberJkt } from '../../lib/scraper/jkt48.js';

export const handler = 'jktmember'
export const description = 'Show Member Of JKT 48'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    const mem = await memberJkt(psn);
    const cards = await Promise.all(mem.map(async (result) => ({
        body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `*https://jkt48.com/member/detail/id/${result.memberId}?lang=id*`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: ` © Fetched From \`https://jkt48.com/\``
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `*${result.name}*`,
            hasMediaAttachment: true,
            ...(await prepareWAMessageMedia({ image: { url: `https://jkt48.com${result.imageUrl}` } }, { upload: sock.waUploadToServer }))
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: `{"display_text":"Detail Member","id":"dmjkt ${result.memberId}"}`
                },
            ]
        })
    })))
    const msge = generateWAMessageFromContent(id, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    contextInfo: {
                        // mentionedJid: [m.sender],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Powered By : Roy',
                            serverMessageId: -1
                        },
                        // businessMessageForwardInfo: { businessOwnerJid: sock.decodeJid(sock.user.id) },
                        forwardingScore: 256,
                        externalAdReply: {
                            title: 'Roy',
                            thumbnailUrl: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
                            sourceUrl: 'https://whatsapp.com/channel/0029ValMR7jDp2Q7ldcaNK1L',
                            mediaType: 2,
                            renderLargerThumbnail: false
                        }
                    },
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: `*[JKT 48 MEMBER LIST ${new Date().getFullYear()}]*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: ' © Copyright By KanataV3'
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards
                    })
                })
            }
        }
    }, { id: m.chat, quoted:m })
    await sock.relayMessage(id, msge.message, { messageId: msge.key.id })
    await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
};
