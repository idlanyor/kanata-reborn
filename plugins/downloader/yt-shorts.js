import { ytShorts } from "../../lib/scraper/yt-shorts.js";
import { ytVideo } from "../../lib/scraper/ytmp4.js";
import { ytsearch } from "../../lib/youtube.js";
import axios from 'axios'

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
        await sock.sendMessage(id, { text: '🔄 *Sedang diproses...* \n_Mohon tunggu sebentar_ ...' });

        // Cek apakah input adalah URL YouTube
        if (psn.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
            const result = await ytVideo(psn)
            const videoInfo = await ytsearch(psn);

            caption = '*YouTube Shorts Downloader*';
            caption += `\n\n📹 *Judul:* ${videoInfo[0].title}`;
            caption += `\n📺 *Channel:* ${videoInfo[0].author}`;
            caption += `\n🔗 *URL:* ${videoInfo[0].url}`;

            // await sock.sendMessage(id, {
            //     image: { url: videoInfo[0].image },
            //     caption
            // });

            await sock.sendMessage(id, {
                video: { url: result.videoSrc },
                caption: `*${videoInfo[0].title}*\n\nBerhasil diunduh menggunakan Kanata V3`
            });
        } else {
            await sock.sendMessage(id, { text: '❌ *URL tidak valid! Masukkan URL YouTube yang benar.*' });
        }
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Ups,Terjadi kesalahan Silahkan coba beberapa saat lagi*' });
        throw error
    }
};
