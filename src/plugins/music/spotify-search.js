import pkg, { generateWAMessageFromContent } from '@seaavey/baileys';
const { proto, prepareWAMessageMedia } = pkg
import { spotifySearch } from '../../lib/neoxr/spotify.js';
export const handler = "spotifysearch"
export const description = "Cari Musik dari *Spotify*";

let image = 'https://files.catbox.moe/nf4pfq.jpg';

const spotifySearchResult = async (query) => {
    const hasilPencarian = await spotifySearch(query);
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
            title: `${hasil.title} - ${hasil.artist || 'Various Artist'}`,
            highlight_label: hasil.duration,
            rows: [
                {
                    title: `Download ${hasil.title}`,
                    description: `${hasil.artist || 'Various Artist'}`,
                    id: `spotify ${hasil.url}`
                }
            ]
        });
    });

    let listMessage = {
        title: '🔍 Hasil Pencarian Spotify',
        sections
    };
    return listMessage;
}

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn == "") {
        return sock.sendMessage(id, { text: "🔎 Mau cari apa?\nKetik *ss <query>*\nContoh: *ss himawari*" });
    }
    let roy = `*Powered By Kanata V3*\nMenampilkan hasil pencarian untuk: "${psn}", klik list untuk info selengkapnya. 🍿`;

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
                                "buttonParamsJson": JSON.stringify(await spotifySearchResult(psn, sender))
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
    }, { quoted: m });
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    await sock.relayMessage(id, msg.message, {
        messageId: msg.key.id
    });
    await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
} 