import { hikaru } from "../../helper/hikaru.js";
export const handler = 'chord'
export const description = 'Get Chord & Lyrics by Title'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        return m.reply('masukkan judul lagu yang ingin dicari chord nya')
    }
    try {
        const { data } = await hikaru('music/chord', {
            params: {
                song: psn
            }
        })
        const text = `🎸 *${data.result.title}* 🎶
🎼 *Chord:*
\`\`\`
${data.result.chord}
\`\`\`
`;

        return await m.reply(text)
    } catch (error) {
        return await m.reply('Terjadi Kesalahan' + error.message)
    }

};
