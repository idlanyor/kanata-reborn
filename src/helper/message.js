import pkg from '@fizzxydev/baileys-pro'
const { generateWAMessageFromContent, proto } = pkg

export function addMessageHandler(m, sock) {
    m.chat = m.key.remoteJid;
    m.sender = m.key.fromMe ? sock.user.id : (m.key.participant || m.key.remoteJid);
    m.senderNumber = m.sender.split('@')[0];
    m.pushName = m.pushName || 'No Name';
    m.isGroup = m.chat.endsWith('@g.us');
    m.type = getMessageType(m.message);
    m.body = (() => {
        if (!m.message) return null;

        const msg = m.message;

        if (msg.conversation) return msg.conversation;
        if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
        if (msg.imageMessage?.caption) return msg.imageMessage.caption;
        if (msg.videoMessage?.caption) return msg.videoMessage.caption;
        if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
        if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId;
        if (msg.templateButtonReplyMessage?.selectedId) return msg.templateButtonReplyMessage.selectedId;
        if (msg.interactiveResponseMessage?.body?.text) return msg.interactiveResponseMessage.body.text;
        if (msg.contactMessage) return '[Contact]';
        if (msg.locationMessage) return '[Location]';
        if (msg.liveLocationMessage) return '[Live Location]';
        if (msg.documentMessage) return `[Document: ${msg.documentMessage.fileName || 'unknown'}]`;
        if (msg.audioMessage) return '[Audio]';
        if (msg.stickerMessage) return '[Sticker]';
        if (msg.imageMessage) return '[Image]';
        if (msg.videoMessage) return '[Video]';

        return '[Unknown Message]';
    })();
    m.react = async (emoji) => {
        if (!emoji) emoji = '❌';

        const reactions = {
            success: '✅',
            fail: '❌',
            wait: '⏳',
            ping: '🏓',
            done: '✔️',
            error: '⚠️',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '🔄',
            question: '❓'
        };

        const reactionEmoji = reactions[emoji.toLowerCase()] || emoji;

        await sock.sendMessage(m.chat, {
            react: {
                text: reactionEmoji,
                key: m.key
            }
        });
    };
    m.groupMetadata = m.isGroup ? sock.groupMetadata(m.chat) : null;

    m.isOwner = () => {
        const number = m.sender.split('@')[0]
        return globalThis.ownerNumber.includes(number)
    }
    m.download = (m.type === 'image' || m.type === 'video' || m.type === 'audio' || m.type === 'document' || m.type === 'sticker') ? async () => {
        return (await getMedia({
            message: m.message,
            key: m.key
        })).buffer;
    } : null;

    m.isBotAdmin = m.isGroup ? (
        async () => {
            const metadata = await m.groupMetadata;
            return metadata?.participants?.find(p => p.id === sock.user.id)?.admin !== null;
        }
    )() : false;

    m.isAdmin = m.isGroup ? (
        async () => {
            const metadata = await m.groupMetadata;
            return metadata?.participants?.find(p => p.id === m.sender)?.admin !== null;
        }
    )() : false;

    m.quoted = null;
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;

        // Cek jika quoted message adalah view once
        const viewOnceMsg = quotedMsg?.viewOnceMessageV2?.message;
        const actualMsg = viewOnceMsg || quotedMsg;

        m.quoted = {
            message: actualMsg,
            key: {
                remoteJid: m.chat,
                fromMe: m.message.extendedTextMessage.contextInfo.participant === sock.user.id,
                id: m.message.extendedTextMessage.contextInfo.stanzaId,
                participant: m.message.extendedTextMessage.contextInfo.participant
            },
            type: getMessageType(actualMsg),
            sender: m.message.extendedTextMessage.contextInfo.participant,
            senderNumber: m.message.extendedTextMessage.contextInfo.participant.split('@')[0],
            caption: getQuotedText(actualMsg),
            text: m.message?.extendedTextMessage?.text,
            download: async () => {
                return (await getMedia({
                    message: quotedMsg,
                    key: m.quoted.key
                })).buffer;
            }
        };
    }

    m.download = async () => {
        return (await getMedia({
            message: m.message,
            key: m.key
        })).buffer;
    };

    m.reply = async (text, quoted = true, useContext = true, newsletterName = `${globalThis.botName}`) => {
        const defaultContext = {
            isForwarded: true,
            forwardingScore: 9999999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363305152329358@newsletter',
                newsletterName: newsletterName,
                serverMessageId: -1
            },
            externalAdReply: {
                title: `乂 ${globalThis.botName} 乂`,
                body: globalThis.owner,
                thumbnailUrl: `${globalThis.ppUrl}`,
                sourceUrl: "https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
        // console.log(defaultContext)

        if (typeof text === 'string') {
            return await sock.sendMessage(m.chat, {
                text: text,
                contextInfo: useContext ? defaultContext : undefined
            }, {
                quoted: quoted ? m : null
            })
        }

        if (typeof text === 'object') {
            if (text.newsletterName) {
                defaultContext.forwardedNewsletterMessageInfo.newsletterName = text.newsletterName
                delete text.newsletterName
            }

            // Jika text.contextInfo ada dan useContext true, gabungkan dengan defaultContext
            const contextInfo = useContext ? {
                ...defaultContext,
                ...(text.contextInfo || {})
            } : text.contextInfo

            return await sock.sendMessage(m.chat, {
                ...text,
                contextInfo: contextInfo
            }, {
                quoted: quoted ? m : null
            })
        }
    };


    // Method untuk button biasa
    m.sendButton = async (text, sections = [], opts = {}) => {
        const defaultOpts = {
            header: 'Kanata Bot',
            footer: '© 2024 Kanata',
            viewOnce: true,
            quoted: true
        }

        opts = { ...defaultOpts, ...opts }

        return await sock.sendMessage(m.chat, {
            text: text,
            footer: opts.footer,
            buttons: [
                {
                    buttonId: 'action',
                    buttonText: {
                        displayText: 'List Menu'
                    },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: opts.header,
                            sections: sections
                        })
                    }
                }
            ],
            headerType: 1,
            viewOnce: true
        }, {
            quoted: opts.quoted ? m : null
        })
    }

    // Method buat interactive button
    m.sendInteractiveButton = async (text, buttons = [], opts = {}) => {
        const defaultOpts = {
            header: 'Kanata Bot',
            footer: '© 2024 Kanata',
            media: null,
            mediaType: 'image',
            newsletterName: 'Kanata Bot',
            sections: [], // Buat list sections
            buttonText: 'Pilih Menu', // Text buat list button
            externalAdReply: {
                showAdAttribution: true,
                title: `乂 ${globalThis.botName} 乂`,
                body: `${globalThis.owner}`,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: globalThis.ppUrl,
                sourceUrl: `${globalThis.ppUrl}`,
                mediaType: 1
            }
        }

        opts = { ...defaultOpts, ...opts }

        let messageContent = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: text
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: opts.footer
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: opts.header,
                            subtitle: 'Created by Roynaldi',
                            hasMediaAttachment: !!opts.media
                        }),
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 9999999
                        },
                        externalAdReply: opts.externalAdReply,
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: opts.sections.length > 0 ? [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: opts.header,
                                    buttonText: opts.buttonText,
                                    sections: opts.sections
                                })
                            }] : buttons
                        })
                    })
                }
            }
        }

        let msg = await generateWAMessageFromContent(m.chat, messageContent, {
            quoted: {
                key: {
                    remoteJid: 'status@broadcast',
                    participant: "13135550002@s.whatsapp.net",
                },
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: '120363293401077915@newsletter',
                        newsletterName: 'Roy',
                        caption: 'Kanata V3'
                    }
                }
            }
        })

        return await sock.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        })
    }

    m.sendListMessage = async (text, sections = [], opts = {}) => {
        const defaultOpts = {
            header: 'Kanata Bot',
            footer: '© 2024 Kanata',
            buttonText: 'Pilih Menu',
            quoted: true,
            newsletterName: 'Kanata Bot',
            externalAdReply: {
                title: "Kanata Bot",
                body: "Simple WhatsApp Bot",
                thumbnailUrl: globalThis.ppUrl,
                sourceUrl: "https://github.com/base-kanata",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }

        opts = { ...defaultOpts, ...opts }

        const listMessage = {
            text: text,
            footer: opts.footer,
            title: opts.header,
            buttonText: opts.buttonText,
            sections: sections,
            viewOnce: true,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305152329358@newsletter',
                    newsletterName: opts.newsletterName,
                    serverMessageId: -1
                },
                externalAdReply: opts.externalAdReply
            }
        }

        return await sock.sendMessage(m.chat, listMessage, {
            quoted: opts.quoted ? m : null
        })
    }
    m.isViewOnce = !!(m.message?.viewOnceMessageV2 || m.message?.viewOnceMessage);

    return m;
}
// Cek apakah pesan merupakan View Once
// cek tipe message
function getMessageType(message) {
    if (!message) return null;

    const types = {
        conversation: 'text',
        extendedTextMessage: 'text',
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        documentMessage: 'document',
        stickerMessage: 'sticker',
        contactMessage: 'contact',
        locationMessage: 'location',
        contactsArrayMessage: 'contacts',
        liveLocationMessage: 'liveLocation',
        templateButtonReplyMessage: 'template',
        buttonsResponseMessage: 'buttons',
        listResponseMessage: 'list',
        interactiveResponseMessage: 'interactive'
    };

    const messageType = Object.keys(message)[0];

    // Tambahan penanganan untuk stiker
    if (messageType === 'stickerMessage') {
        const stickerInfo = message[messageType];
        return {
            type: 'sticker',
            isAnimated: stickerInfo.isAnimated || false,
            mimetype: stickerInfo.mimetype,
            fileLength: stickerInfo.fileLength,
            height: stickerInfo.height,
            width: stickerInfo.width
        };
    }

    return types[messageType] || messageType;
}

function getQuotedText(message) {
    if (!message) return null;

    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;

    return null;
}

import { getMedia } from './mediaMsg.js';   