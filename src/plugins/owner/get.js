import { checkOwner } from '../../helper/permission.js';

export default async ({ sock, m, id, noTel, psn }) => {
    // if (!await checkOwner(sock, id, noTel)) return;

    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan URL yang akan di-GET!\n*Contoh:* !get https://api.example.com/data' });
        return;
    }

    try {
        let [url, ...headerStrings] = psn.split('\n');
        let headers = new Headers();

        // Parse headers jika ada
        if (headerStrings.length > 0) {
            headerStrings.forEach(header => {
                const [key, value] = header.split(':').map(s => s.trim());
                if (key && value) headers.append(key, value);
            });
        }

        // Kirim loading reaction
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        // Lakukan request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                ...Object.fromEntries(headers) // Tetap masukkan headers dari input
            }
        });

        const contentType = response.headers.get('content-type');
        const fileName = url.split('/').pop() || 'file';
        let data = await response.text(); // Ambil response sebagai teks

        if (contentType.includes('application/json')) {
            // Tangani JSON response terlebih dahulu
            const json = await response.json(); // Mengambil JSON dari response
            let jsonString = JSON.stringify(json, null, 2);
            await sock.sendMessage(id, {
                text: `🛜 *GET Request*\n\n📃 *Response:*\n${jsonString}`,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: url,
                    }
                }
            });
        } else if (contentType.includes('image')) {
            const imageUrl = response.url; // Mengambil URL gambar dari response
            await sock.sendMessage(id, {
                image: { url: imageUrl }, // Menggunakan URL gambar
                caption: '☑️ Response 200 OK ☑️',
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: imageUrl,
                        thumbnailUrl: `${globalThis.ppUrl}`,
                        sourceUrl: imageUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        } else if (contentType.includes('video')) {
            const videoUrl = response.url; // Mengambil URL video dari response
            await sock.sendMessage(id, {
                video: { url: videoUrl }, // Menggunakan URL video
                caption: '☑️ Response 200 OK ☑️',
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: videoUrl,
                        thumbnailUrl: `${globalThis.ppUrl}`,
                        sourceUrl: videoUrl,
                        mediaType: 2, // Mengubah mediaType menjadi 2 untuk video
                        renderLargerThumbnail: true
                    }
                }
            });
        } else if (contentType.includes('audio')) {
            await sock.sendMessage(id, {
                audio: { url: audioUrl }, // Menggunakan URL audio
                mimetype: 'audio/mpeg',
                fileName: `${fileName}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: audioUrl,
                        thumbnailUrl: `${globalThis.ppUrl}`,
                        sourceUrl: audioUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        } else if (contentType.includes('application') || contentType.includes('text/csv')) {
            const documentUrl = response.url; // Mengambil URL dokumen dari response
            await sock.sendMessage(id, {
                document: { url: documentUrl }, // Menggunakan URL dokumen
                mimetype: contentType,
                fileName: fileName,
                caption: `🛜 *GET Request - Document*\n📃 *Type:* ${contentType}`,
                contextInfo: {
                    externalAdReply: {
                        title: '乂 API Request 乂',
                        body: documentUrl,
                    }
                }
            });
        } else {
            // Jika bukan file media atau json, kirim sebagai teks
            await sock.sendMessage(id, { text: `🛜 *GET Request*\n\n📃 *Response:*\n${JSON.stringify(data, null, 2)}` });
        }

        // Kirim reaction sukses
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });
    } catch (error) {
        let errorMessage = `❌ *ERROR*\n\n`;
        errorMessage += error.message;
        await sock.sendMessage(id, { text: errorMessage });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};

export const handler = 'get';
export const description = 'Melakukan HTTP GET request';


