import axios from "axios";

export const description = "🐦 Simple Twitter/X Video Downloader by *FastURL*";
export const handler = "xd";

export default async ({ sock, m, id, psn }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📥 *Format salah bro!*\n\nKetik:\n`xd <url>`\n\nContoh:\n`xd https://x.com/i/status/1823260489704669415`'
        });
        return;
    }

    try {
        await sock.sendMessage(id, { react: { text: '⏳', key: m.key } });

        const res = await axios.get(globalThis.hikaru.baseUrl + `downup/twdown/simple?url=${encodeURIComponent(psn)}`, {
            headers: { 
                accept: 'application/json',
                'x-api-key': globalThis.hikaru.apiKey
            }
        });

        const result = res.data?.result;

        if (!result?.videohd && !result?.videosd) {
            await sock.sendMessage(id, {
                text: `❌ *Gagal:* Video nggak ditemukan di URL itu 😢`
            });
            return;
        }

        // Kirim thumbnail (opsional)
        if (result.thumb) {
            await sock.sendMessage(id, {
                image: { url: result.thumb },
                caption: `📸 *Thumbnail Video*\n\n📝 ${result.desc || 'Tanpa deskripsi'}`
            });
        }

        // Kirim video (HD kalau ada, fallback ke SD)
        const videoUrl = result.videohd || result.videosd;
        await sock.sendMessage(id, {
            video: { url: videoUrl },
            caption: `🎞️ *Video berhasil diunduh!*\n📝 ${result.desc || 'Tanpa deskripsi'}\n\n👨‍💻 Kanata V3`
        });

        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('❌ Error:', error);
        await sock.sendMessage(id, {
            text: '❌ *Terjadi error:* \n' + error.message
        });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};
