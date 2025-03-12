import fs from 'fs'
export const handler = 'tesdoc'
export const description = ''
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    let buttonMessage = {
        document: { url: "https://www.youtube.com/" },
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileName: "「 Kanata 」",
        fileLength: 999999999999999,
        pageCount: 999999999999999,
        contextInfo: {
            forwardingScore: 555,
            isForwarded: true,
            externalAdReply: {
                mediaUrl: "https://www.youtube.com/",
                mediaType: 2,
                previewType: "pdf",
                title: "kamu mana punya",
                body: "ini",
                thumbnail: fs.readFileSync("./kanata.jpg"),
                sourceUrl: "https://www.youtube.com/",
            },
        },
        caption: "tes",
        footer: "2025",
        buttons: [
            {
                buttonId: "ID MU",
                buttonText: {
                    displayText: 'Display text'
                }
            }, {
                buttonId: "ID MU",
                buttonText: {
                    displayText: "DISPLAY TEXT"
                }
            }
        ],
        viewOnce: true,
        headerType: 6,
    };

    return await sock.sendMessage(m.chat, buttonMessage, { quoted: null });
};
