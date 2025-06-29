/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Shutterstock Search with Carousel
 * @module : ES6 Module
 */
import {  proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';

import { shutterstockSearch } from '../../lib/scraper/shutterstock.js';

export const handler = 'shutterstock'
export const description = 'Search Images from Shutterstock'

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Silakan masukkan kata kunci pencarian!\n\nContoh: !shutterstock anime'
        });
        return;
    }

    await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })

    try {
        const results = (await shutterstockSearch(psn)).data.results;
        // console.log(results)
        if (!results.length) {
            await sock.sendMessage(id, {
                text: '❌ Tidak ditemukan hasil untuk pencarian tersebut.'
            });
            return;
        }

        const cards = await Promise.all(results.map(async (result) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `*${result.title}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: ` © Fetched From Shutterstock`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `*Shutterstock Image*`,
                hasMediaAttachment: true,
                ...(await prepareWAMessageMedia({ image: { url: result.image } }, { upload: sock.waUploadToServer }))
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: 'View Source',
                            url: result.link,
                            merchant_url: result.link,
                        }),
                    }
                ]
            })
        })));

        const message = generateWAMessageFromContent(id, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        contextInfo: {
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363305152329358@newsletter',
                                newsletterName: 'Powered By : Roy',
                                serverMessageId: -1
                            },
                            forwardingScore: 256,
                            externalAdReply: {
                                title: 'Shutterstock Search',
                                thumbnailUrl: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
                                sourceUrl: 'https://whatsapp.com/channel/0029ValMR7jDp2Q7ldcaNK1L',
                                mediaType: 2,
                                renderLargerThumbnail: false
                            }
                        },
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `*[SHUTTERSTOCK SEARCH RESULTS]*\n\n🔍 Kata kunci: "${psn}"\n📸 Total hasil: ${results.length}`
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
        }, { id: m.chat, quoted: m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${error.message}`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
}; 