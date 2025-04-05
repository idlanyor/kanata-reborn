/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pinterest Search with Carousel
 * @module : ES6 Module
 */
import pkg, { generateWAMessageFromContent } from '@fizzxydev/baileys-pro';
const { proto, prepareWAMessageMedia } = pkg
import { pinSearch } from '../../lib/scraper/pinterest.js';

export const handler = 'pinterest'
export const description = 'Search Images from Pinterest'

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Silakan masukkan kata kunci pencarian!\n\nContoh: !pinterest anime ghibli'
        });
        return;
    }

    await sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })

    try {
        const results = (await pinSearch(psn)).data.results;

        if (!results.length) {
            await sock.sendMessage(id, {
                text: '❌ Tidak ditemukan hasil untuk pencarian tersebut.'
            });
            return;
        }

        // Filter hasil yang valid (memiliki gambar dan judul)
        const validResults = results.filter(item =>
            item.image !== 'No Image' &&
            item.title !== 'No Title' &&
            item.image.startsWith('http')
        ).slice(0, 12); // Batasi 12 hasil untuk performa

        const cards = await Promise.all(validResults.map(async (result) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `*${result.title}*`.slice(0, 300) // Batasi panjang judul
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: ` © Fetched From Pinterest`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `*Pinterest Image*`,
                hasMediaAttachment: true,
                ...(await prepareWAMessageMedia({ image: { url: result.image } }, { upload: sock.waUploadToServer }))
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: `{"display_text":"📥 Download","id":"pindl ${result.image}"}`
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
                                title: 'Pinterest Search',
                                thumbnailUrl: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
                                sourceUrl: 'https://whatsapp.com/channel/0029ValMR7jDp2Q7ldcaNK1L',
                                mediaType: 2,
                                renderLargerThumbnail: false
                            }
                        },
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `*[PINTEREST SEARCH RESULTS]*\n\n🔍 Kata kunci: "${psn}"\n📸 Total hasil: ${validResults.length}`
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
        }, { id: m.chat, quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('Pinterest Error:', error);
        await sock.sendMessage(id, {
            text: `❌ Terjadi kesalahan: ${error.message}`
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
}; 