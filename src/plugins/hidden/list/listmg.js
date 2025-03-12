import pkg from '@fizzxydev/baileys-pro';
const { generateWAMessageFromContent, proto } = pkg;
export const handler = "listmg"
export const description = "🎮 *List Mini Games* 🎮";

export default async ({ sock, id, m, noTel, sender }) => {
    let sections = [{
        title: '🎯 *Mini Games Seru* 🎯',
        rows: [
            {
                title: '🖼 *Tebak Gambar*',
                id: `gambar`
            },
            {
                title: '🏳 *Tebak Bendera*',
                id: `bendera`
            },
            {
                title: '😂 *Tebak Kata Jenaka*',
                id: `jenaka`
            },
            {
                title: '🧠 *Teka Teki Sulit - Lontong*',
                id: `lontong`
            },
        ]
    }];

    let listMessage = {
        title: '🎮 *Mini Games Kanata* 🎮',
        sections
    };

    let msgMiniGames = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },

                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: "🕹 *Pilih mini game sing pengen dicoba*"
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: `©Kanata V3 || Roy`
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `🕹 *Daftar Mini Games* 🎯`
                    }),
                    gifPlayback: true,
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            "name": "single_select",
                            "buttonParamsJson": JSON.stringify(listMessage)
                        }]
                    })
                })
            }
        }
    }, {
        quoted: {
            key: {
                remoteJid: '0@s.whatsapp.net',
                participant: '0@s.whatsapp.net'
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363302865191524@newsletter',
                    newsletterName: 'Kanata Bot',
                    caption: sender
                }
            }
        }
    });

    console.log(msgMiniGames);

    await sock.relayMessage(id, msgMiniGames.message, {
        messageId: msgMiniGames.key.id
    });
};
