import pkg, { prepareWAMessageMedia } from '@fizzxydev/baileys-pro';
const { generateWAMessageFromContent, proto } = pkg;
export const sendIAMessage = async (jid, btns = [], quoted, opts = {}, sock) => {
    let messageContent = {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: '*Kanata Bot V3*', // Isi utama pesan
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: opts.footer, // Footer pesan
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: opts.header, // Header pesan
                        subtitle: 'Created by Roynaldi',
                        hasMediaAttachment: !!opts.media, // Apakah ada media?
                    }),
                    contextInfo: {
                        // forwardingScore: 9999, // Nilai forward (opsional)
                        isForwarded: true,
                        forwardingScore: 9999999,
                        isForwarded: true,

                        // mentionedJid: sock.parseMention(opts.header + opts.content + opts.footer),
                    },
                    externalAdReply: {
                        showAdAttribution: true,
                        title: `乂 Kanata 乂`,
                        body: 'Kanata Bot',
                        // mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://files.catbox.moe/2wynab.jpg',
                        mediaType: 1, // Media tipe (default: gambar)
                    },
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: btns, // Tombol interaktif
                    }),
                }),
            },
        },
    };

    // Tambahkan media jika diperlukan
    if (opts.media) {
        const media = await prepareWAMessageMedia(
            {
                [opts.mediaType || 'image']: { url: opts.media },
            },
            { upload: sock.waUploadToServer }
        );
        messageContent.viewOnceMessage.message.interactiveMessage.header.hasMediaAttachment = true;
        Object.assign(messageContent.viewOnceMessage.message.interactiveMessage.header, media);
    }

    // Buat pesan dan kirimkan
    let msg = await generateWAMessageFromContent(jid, messageContent, {
        quoted
    });
    await sock.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id,
    });
};

