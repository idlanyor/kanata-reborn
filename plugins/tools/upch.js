import { checkOwner } from "../../helper/permission.js";

export const handler = 'upch';
export const description = 'Upload To Channel';

export default async ({ sock, m, id, psn, sender,noTel, caption, attf }) => {
    if (!await checkOwner(sock, id, noTel)) return;
    if (!psn && !attf) return sock.sendMessage(id, { text: "Text atau media apa yang mau dikirim ke channel?" });

    let messageOptions = {};
    let mediaType = "";

    if (attf) {
        const mediaType = m.message?.videoMessage?.mimetype || m.message?.imageMessage?.mimetype || m.message?.audioMessage?.mimetype
        console.log(mediaType)
        if (mediaType) {
            media = attf;
        } else {
            return sock.sendMessage(id, { text: "Jenis media tidak didukung! Hanya gambar, video, dan audio!" });
        }
    }

    if (mediaType === "audio") {
        messageOptions.audio = attf;
        messageOptions.mimetype = "audio/mp4";
        messageOptions.ptt = true;
    } else if (mediaType) {
        messageOptions[mediaType] = attf;
        if (psn) messageOptions.caption = psn;
    } else {
        messageOptions.text = psn;
    }

    messageOptions.contextInfo = {
        isForwarded: true,
        serverMessageId: -1,
        forwardingScore: 256,
        externalAdReply: {
            showAdAttribution: true,
            title: 'Kanata-V2',
            body: m.pushName || sender,
            mediaType: 1,
            thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
            mediaType: 1,
            renderLargerThumbnail: false
        },
    };

    await sock.sendMessage(globalThis.newsLetterJid, messageOptions);
    return sock.sendMessage(id, { text: "Pesanmu telah dikirim ke saluran!" });
};
