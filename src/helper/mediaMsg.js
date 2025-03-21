import { downloadContentFromMessage } from "@seaavey/baileys"

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
        // Deteksi tipe media dari pesan
        let mediaType, messageType

        if (msg.message?.videoMessage) {
            messageType = 'videoMessage'
            mediaType = 'video'
        } else if (msg.message?.audioMessage) {
            messageType = 'audioMessage'
            mediaType = 'audio'
        } else if (msg.message?.imageMessage) {
            messageType = 'imageMessage'
            mediaType = 'image'
        } else {
            throw new Error('Tipe media tidak didukung')
        }

        // Download konten media
        const stream = await downloadContentFromMessage(msg.message[messageType], mediaType)
        let buffer = Buffer.from([])

        // Gabungkan chunk data menjadi buffer
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    } catch (error) {
        console.error('Error saat mengunduh media:', error)
        throw new Error('Gagal mengunduh media: ' + error.message)
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