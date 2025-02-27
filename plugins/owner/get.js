import axios from 'axios';
import { checkOwner } from '../../helper/permission.js';

export default async ({ sock, m, id, noTel, psn }) => {
    if (!await checkOwner(sock, id, noTel)) return;

    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan URL yang akan di-GET!\n*Contoh:* !get https://api.example.com/data' });
        return;
    }

    try {
        let [url, ...headerStrings] = psn.split('\n');
        let headers = {};

        // Parse headers jika ada
        if (headerStrings.length > 0) {
            headerStrings.forEach(header => {
                const [key, value] = header.split(':').map(s => s.trim());
                if (key && value) headers[key] = value;
            });
        }

        // Kirim loading reaction
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        // Lakukan request
        const response = await axios.get(url, {
            headers,
        });
        const contentType = response.headers['content-type'];
        const fileName = url.split('/').pop() || 'file';

        if (contentType.includes('application/json')) {
            // Tangani JSON response terlebih dahulu
            let jsonString = JSON.stringify(response.data, null, 2);
            await sock.sendMessage(id, {
                text: `🛜 *GET Request*\n\n📃 *Response:*\n${jsonString}`
            });
        } else if (contentType.includes('image')) {
            await sock.sendMessage(id, {
                image: Buffer.from(response.data),
                caption: '☑️ Response 200 OK ☑️',
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: url,
                        thumbnailUrl: `${globalThis.ppUrl}`,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        } else if (contentType.includes('video')) {
            await sock.sendMessage(id, {
                video: Buffer.from(response.data),
                caption: '☑️ Response 200 OK ☑️',
            });
        } else if (contentType.includes('audio')) {
            await sock.sendMessage(id, {
                audio: Buffer.from(response.data),
                mimetype: 'audio/mp4',
                fileName: `${fileName}.mp3`,
            });
        } else if (contentType.includes('application') || contentType.includes('text/csv')) {
            await sock.sendMessage(id, {
                document: Buffer.from(response.data),
                mimetype: contentType,
                fileName: fileName,
                caption: `🛜 *GET Request - Document*\n📃 *Type:* ${contentType}`,
            });
        } else {
            // Jika bukan file media atau json, kirim sebagai teks
            const textData = response.data.toString('utf-8');
            await sock.sendMessage(id, { text: `🛜 *GET Request*\n\n📃 *Response:*\n${textData}` });
        }

        // Kirim reaction sukses
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });
    } catch (error) {
        let errorMessage = `❌ *ERROR*\n\n`;
        if (error.response) {
            errorMessage += `Status: ${error.response.status}\n`;
            errorMessage += `Data: ${JSON.stringify(error.response.data, null, 2)}`;
        } else {
            errorMessage += error.message;
        }
        await sock.sendMessage(id, { text: errorMessage });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};

export const handler = 'get';
export const description = 'Melakukan HTTP GET request';
