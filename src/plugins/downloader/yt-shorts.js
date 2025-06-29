import axios from 'axios';

export const description = "YouTube Short Downloader provided by *Roy*";
export const handler = ['ysd', 'yd2']
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`ysd <url yt-shorts>`\n\nContoh:\n`ysd https://www.youtube.com/shorts/xnxxxxxsx`'
        });
        return;
    }
    try {
        await m.react('wait')
        await sock.sendMessage(id, { text: '🔄 *Sedang diproses...* \n_Mohon tunggu sebentar_ ...' });

        // Cek apakah input adalah URL YouTube
        if (psn.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
            const response = await axios.get(globalThis.hikaru.baseUrl + `downup/ytmp4`, {
                params: {
                    url: psn,
                    quality: '360',
                    server: 'server2'
                },
                headers: {
                    'accept': 'application/json',
                    'x-api-key': globalThis.hikaru.apiKey
                }
            });

            const result = response.data.result;
            
            caption = '*YouTube Shorts Downloader*';
            caption += '\n\n📹 *Judul:* ' + result.title;
            caption += '\n📺 *Channel:* ' + result.author.name;
            caption += '\n⏱️ *Durasi:* ' + result.metadata.duration;
            caption += '\n👁️ *Views:* ' + result.metadata.views;
            caption += '\n📅 *Upload:* ' + result.metadata.uploadDate;
            caption += '\n🔗 *URL:* ' + result.url;

            await sock.sendMessage(id, {
                video: { url: result.media },
                caption: caption
            }, { quoted: m });

            await m.react('success')
        } else {
            await m.react('error')
            await sock.sendMessage(id, { text: '❌ *URL tidak valid! Masukkan URL YouTube yang benar.*' });
        }
    } catch (error) {
        await m.react('error')
        await sock.sendMessage(id, { text: '❌ *Ups,Terjadi kesalahan Silahkan coba beberapa saat lagi*' });
        throw error
    }
};
