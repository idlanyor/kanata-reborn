import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';

export const handler = "listdl"
export const description = "📥 *List Downloader Tools* 📥";

export default async ({ sock, id, m, noTel, sender }) => {
    let sections = [{
        title: '🚀 *Downloader Tools* 🚀',
        rows: [
            {
                title: '🎵 *Tiktok Video Downloader by URL*',
                id: `td`
            },
            {
                title: '🎶 *Tiktok Audio Downloader by URL*',
                id: `tmd`
            },
            {
                title: '📹 *Instagram Video Downloader by URL*',
                id: `igv`
            },
            {
                title: '🖼 *Instagram Picture Downloader by URL*',
                id: `igp`
            },
            {
                title: '📺 *Download Youtube Video by URL*',
                id: `yd`
            },
            {
                title: '🎧 *Play Youtube Audio by Query*',
                id: `yp`
            },
            {
                title: '📼 *Play Youtube Video by Query*',
                id: `yv`
            },
            {
                title: '🎤 *Download Youtube Music by URL*',
                id: `ymd`
            },
        ]
    }];

    let listMessage = {
        title: '📥 *Downloader Menu* 📥',
        sections
    };

    let msgDownloader = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },

                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: "📥 *Pilih downloader sing pengen karo pencet tombol ing ngisor iki* 📥"
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: `©Kanata V3 || Roy`
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `🛠 *Downloader Tools* 🛠`
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

    console.log(msgDownloader);

    await sock.relayMessage(id, msgDownloader.message, {
        messageId: msgDownloader.key.id
    });
};
