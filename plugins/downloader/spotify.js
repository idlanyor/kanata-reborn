import { spotify } from "../../lib/downloader.js";
export const description = "Spotify Downloader provided by *Roidev*";
export const handler = "spotify"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '🎵 *Gunakan format: * \n\n`spotify <url>`\n\nContoh:\n`spotify https://open.spotify.com/track/2gcMYiZzzmzoF8PPAfL3IO?si=XGDKMzmmSJ2rHjvpE_Yuow`'
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Sedang Memproses...* Mohon tunggu sebentar...' });
        let result = await spotify(psn);
        let caption = `🎵 *Judul:* ${result.title}\n🎤 *Artis:* ${result.artist}\n⏳ *Durasi:* ${result.duration}`
        await sock.sendMessage(id, { image: { url: result.thumbnail }, caption }, { quoted: m })
        await sock.sendMessage(id, { audio: { url: result.audio }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error });
    }
};
