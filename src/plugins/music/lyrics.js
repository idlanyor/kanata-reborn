import { googleLyrics } from "../../lib/scraper/lyrics.js";
export const handler = 'lirik'
export const description = 'Get Lyrics by title'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        return m.reply('masukkan judul lagu yang ingin dicari liriknya')
    }
    try {
        const response = await googleLyrics(psn)
        const message = `🎶 *${response.title}* 🎶
👤 *Artist:* ${response.artist}
📀 *Album:* ${response.album}
🎵 *Genre:* ${response.genre}
📅 *Released:* ${response.released}

🔗 *Available on:* ${response.platform.join(", ")}

📝 *Lyrics:*
\`\`\`
${response.lyrics}
\`\`\`
`;
        m.reply(message);
    } catch (e) {
        m.reply('Terjadi kesalahan saat mengambil lirik.', e);
    }

};
