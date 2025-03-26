import pkg, { generateWAMessageFromContent } from '@fizzxydev/baileys-pro';
const { proto, prepareWAMessageMedia } = pkg
import { ytsearch } from "../../lib/youtube.js";
export const handler = "yts"
export const description = "Cari Video dari *YouTube* khusus Grup";

let image = 'https://files.catbox.moe/n9hro3.jpg';

const ytSearchResult = async (query) => {
    const hasilPencarian = await ytsearch(query);
    let sections = [{
        title: "Kanata V3",
        highlight_label: 'Start Chats',
        rows: [{
            header: "Kanata V3",
            title: "Menu",
            description: `Kembali ke menu!`,
            id: '.menu'
        },
        {
            header: "Kanata V3",
            title: "Owner Bot",
            description: "Owner bot Kanata V3",
            id: '.owner'
        }]
    }];

    hasilPencarian.forEach((hasil) => {
        sections.push({
            title: hasil.title,

            rows: [
                {
                    title: "Get Video HD 🎬",
                    description: `${hasil.title}`,
                    id: `yd ${hasil.url}`
                },
                {
                    title: "Get Video 🎥",
                    description: `${hasil.title}`,
                    id: `yd2 ${hasil.url}`
                },
                {
                    title: "Get Audio 🎵",
                    description: `${hasil.title}`,
                    id: `ymd ${hasil.url}`
                }
            ]
        });
    });

    let listMessage = {
        title: '🔍 Hasil Pencarian YouTube',
        sections
    };
    return listMessage;
}

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn == "") {
        return sock.sendMessage(id, { text: "🔎 Mau cari apa?\nKetik *yts <query>*\nContoh: *yts himawari*" });
    }
    if (id.endsWith('@g.us')) {
        let roy = `*Powered By Kanata V3*\nMenampilkan hasil pencarian untuk: "${psn}", pilih di bawah ini sesuai format yang Kamu inginkan. 🍿`;

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    "messageContextInfo": {
                        "deviceListMetadata": {},
                        "deviceListMetadataVersion": 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: roy
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: '©️ Kanata V3'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            subtitle: sender,
                            hasMediaAttachment: true,
                            ...(await prepareWAMessageMedia({ image: { url: image } }, { upload: sock.waUploadToServer }))
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    "name": "single_select",
                                    "buttonParamsJson": JSON.stringify(await ytSearchResult(psn, sender))
                                },
                                {
                                    "name": "quick_reply",
                                    "buttonParamsJson": "{\"display_text\":\"Owner Bot\",\"id\":\"owner\"}"
                                }
                            ],
                        })
                    })
                }
            }
        }, { quoted:m });
        sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
        await sock.relayMessage(id, msg.message, {
            messageId: msg.key.id
        });
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
    } else {
        sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
        const hasilPencarian = await ytsearch(psn);
        const cards = await Promise.all(hasilPencarian.map(async (result) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `*${result.url}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: ` © Copyright By ${result.author}`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `*${result.title}*`,
                hasMediaAttachment: true,
                ...(await prepareWAMessageMedia({ image: { url: result.image } }, { upload: sock.waUploadToServer }))
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: `{"display_text":"🎬 Download Video HD","id":"yd ${result.url}"}`
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: `{"display_text":"📽️ Download Video","id":"yd2 ${result.url}"}`
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: `{"display_text":"🎵 Download Audio","id":"ymd ${result.url}"}`
                    }
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
                            text: `*[Youtube Search Result]*`
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
    }


};
