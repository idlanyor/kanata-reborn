import baileys from '@fizzxydev/baileys-pro'
export const handler = 'tesalb'
export const description = ''
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    async function sendAlbumMessage(jid, medias, options) {
        options = { ...options };

        const caption = options.text || options.caption || "";

        const album = baileys.generateWAMessageFromContent(jid, {
            albumMessage: {
                expectedImageCount: medias.filter(media => media.type === "image").length,
                expectedVideoCount: medias.filter(media => media.type === "video").length,
                ...(options.quoted ? {
                    contextInfo: {
                        remoteJid: options.quoted.key.remoteJid,
                        fromMe: options.quoted.key.fromMe,
                        stanzaId: options.quoted.key.id,
                        participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                        quotedMessage: options.quoted.message
                    }
                } : {})
            }
        }, { quoted:m });

        await sock.relayMessage(m.chat, album.message, {
            messageId: album.key.id
        });

        for (const media of medias) {
            const { type, data } = media;
            const img = await baileys.generateWAMessage(album.key.remoteJid, {
                [type]: data,
                ...(media === medias[0] ? { caption } : {})
            }, {
                upload: sock.waUploadToServer
            });
            img.message.messageContextInfo = {
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key
                }
            };
            await sock.relayMessage(img.key.remoteJid, img.message, {
                messageId: img.key.id
            });
        }

        return album;
    }

    // How to use ?
    sendAlbumMessage(m.chat, [
        { type: "image", data: { url: "https://telegra.ph/file/8360caca1efd0f697d122.jpg" } },
        { type: "image", data: { url: "https://telegra.ph/file/8360caca1efd0f697d122.jpg" } },
        { type: "image", data: { url: "https://telegra.ph/file/8360caca1efd0f697d122.jpg" } },
        { type: "image", data: { url: "https://telegra.ph/file/8360caca1efd0f697d122.jpg" } }
    ], { caption: "© Kanata -2025" });
};
