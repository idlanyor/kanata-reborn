import { ryzen } from "../../helper/ryzen.js";
import { ytShorts } from "../../lib/scraper/yt-shorts.js";

export const description = "YouTube Short Downloader provided by *Roidev*";
export const handler = "ysd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`ysd <url yt-shorts>`\n\nContoh:\n`ysd https://www.youtube.com/shorts/xnxxxxxsx`'
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Sedang diproses...* \n_Mohon tunggu sebentar_ ...' });
        let { data } = await ryzen('downloader/ytmp4', {
            params: { url: psn }
        })
        await sock.sendMessage(id, { video: await fetch(data.url) });
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Ups,Terjadi kesalahan Silahkan coba beberapa saat lagi*' });
        throw error
    }
};
