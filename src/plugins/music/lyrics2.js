import { hikaru } from "../../helper/hikaru.js";
export const handler = 'lirik2'
export const description = 'Get Lyrics by title'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) {
        return m.reply('masukkan judul lagu yang ingin dicari liriknya')
    }
    try {
        const { data } = await hikaru('music/songlyrics-v2', {
            params: {
                name: psn
            }
        })
        // console.log(data)
// return 
        const text = `🎶 *${data.result.title}* 🎶
👤 *Artist:* ${data.result.artist}
📅 *Release Date:* ${data.result.release}
🔗 *Genius URL:* ${data.result.url}
🎵 *YouTube:* ${data.result.youtube}
🍏 *Apple Music:* ${data.result.appleMusicPlayer}

📝 *Lyrics:*
${data.result.lyrics.map(lyric => lyric.text).join("\n")}`;

        return await sock.sendMessage(id, {
            image: { url: data.result.albumCover },
            caption: text
        }, { quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } })
    } catch (error) {
        return await m.reply('Terjadi Kesalahan' + error.message)
    }

};
