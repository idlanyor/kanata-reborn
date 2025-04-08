import { downloadContentFromMessage } from "@fizzxydev/baileys-pro"

export async function streamToBuffer(readableStream) {
    const reader = readableStream.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    return Buffer.concat(chunks);
}

export const getMedia = async (msg) => {
    try {
        let mediaType, messageType

        if (msg.message?.documentMessage) {
            messageType = 'documentMessage'
            mediaType = 'document'
        } else if (msg.message?.videoMessage) {
            messageType = 'videoMessage'
            mediaType = 'video'
        } else if (msg.message?.audioMessage) {
            messageType = 'audioMessage'
            mediaType = 'audio'
        } else if (msg.message?.imageMessage) {
            messageType = 'imageMessage'
            mediaType = 'image'
        } else if (msg.message?.stickerMessage) {
            messageType = 'stickerMessage'
            mediaType = 'sticker'
        } else {
            throw new Error('Unsupported media type')
        }

        const stream = await downloadContentFromMessage(msg.message[messageType], mediaType)
        let buffer = Buffer.from([])

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        const result = {
            buffer,
            mimetype: msg.message[messageType]?.mimetype,
            fileName: msg.message[messageType]?.fileName
        }

        return result

    } catch (error) {
        console.error('Error downloading media:', error)
        throw new Error('Failed to download media: ' + error.message)
    }
}

export const getBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}
