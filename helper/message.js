import pkg, { downloadContentFromMessage } from '@seaavey/baileys'

export function addMessageHandler(m, sock) {
    // Basic message info
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.id = m.key.id;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.fromMe ? sock.user.id : m.isGroup ? m.key.participant : m.chat;
    m.pushName = m.pushName || 'User';

    // Message type detection
    m.type = getContentType(m.message);
    m.body = m.message?.conversation || m.message?.[m.type]?.text || m.message?.[m.type]?.caption || '';
    
    // Quoted message
    const quotedM = m.message?.[m.type]?.contextInfo?.quotedMessage;
    m.quoted = quotedM;
    
    if (quotedM) {
        const quotedType = getContentType(quotedM);
        m.quotedMsg = {
            type: quotedType,
            body: quotedM?.conversation || 
                  quotedM?.[quotedType]?.text || 
                  quotedM?.[quotedType]?.caption || 
                  quotedM?.viewOnceMessageV2?.message?.imageMessage?.caption ||
                  quotedM?.viewOnceMessageV2?.message?.videoMessage?.caption || '',
            sender: m.message?.[m.type]?.contextInfo?.participant,
            id: m.message?.[m.type]?.contextInfo?.stanzaId,
            download: async () => {
                // Handle view once message
                if (quotedM?.viewOnceMessageV2?.message?.imageMessage) {
                    return await downloadMedia(quotedM.viewOnceMessageV2.message.imageMessage);
                }
                if (quotedM?.viewOnceMessageV2?.message?.videoMessage) {
                    return await downloadMedia(quotedM.viewOnceMessageV2.message.videoMessage);
                }
                // Handle normal message
                return await downloadMedia(quotedM[quotedType]);
            }
        };
    } else {
        m.quotedMsg = null;
    }

    // Permission checks
    m.isOwner = globalThis.isOwner(m.sender.split('@')[0]);
    m.isAdmin = async () => {
        if (!m.isGroup) return false;
        const groupMetadata = await sock.groupMetadata(m.chat);
        const participant = groupMetadata.participants.find(p => p.id === m.sender);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    };
    m.isBotAdmin = async () => {
        if (!m.isGroup) return false;
        const groupMetadata = await sock.groupMetadata(m.chat);
        const botParticipant = groupMetadata.participants.find(p => p.id === sock.user.id);
        return botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    };

    // Media download helpers
    m.download = async () => {
        if (!m.message?.[m.type]) return null;
        return await downloadMedia(m.message?.[m.type]);
    };

    // Reply helper with context
    m.reply = async (text, quoted = true, useContext = true) => {
        const defaultContext = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: globalThis.newsLetterJid,
                newsletterName: globalThis.botName,
                serverMessageId: -1
            },
            externalAdReply: {
                title: `乂 ${globalThis.botName} 乂`,
                body: m.pushName,
                thumbnailUrl: globalThis.kanataThumb,
                sourceUrl: globalThis.newsLetterUrl,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        if (typeof text === 'string') {
            return await sock.sendMessage(m.chat, {
                text,
                contextInfo: useContext ? defaultContext : undefined
            }, {
                quoted: quoted ? m : null
            });
        }

        if (typeof text === 'object') {
            const contextInfo = useContext ? {
                ...defaultContext,
                ...(text.contextInfo || {})
            } : text.contextInfo;

            return await sock.sendMessage(m.chat, {
                ...text,
                contextInfo
            }, {
                quoted: quoted ? m : null
            });
        }
    };

    // React to message
    m.react = async (emoji) => {
        await sock.sendMessage(m.chat, {
            react: {
                text: emoji,
                key: m.key
            }
        });
    };

    // Group helpers
    m.groupMetadata = async () => {
        if (!m.isGroup) return null;
        return await sock.groupMetadata(m.chat);
    };

    m.participants = async () => {
        const metadata = await m.groupMetadata();
        return metadata?.participants || [];
    };

    m.admins = async () => {
        const participants = await m.participants();
        return participants.filter(p => p.admin);
    };

    return m;
}

// Helper function untuk mendapatkan tipe konten pesan
function getContentType(message) {
    if (!message) return null;
    const types = [
        'conversation', 'imageMessage', 'videoMessage', 
        'extendedTextMessage', 'audioMessage', 'stickerMessage',
        'documentMessage', 'contactMessage', 'locationMessage'
    ];
    return types.find(type => message[type]) || null;
}

// Helper function untuk download media
async function downloadMedia(message) {
    if (!message) return null;
    let buffer = Buffer.from([]);
    try {
        const stream = await downloadContentFromMessage(message);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
    return buffer;
}

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