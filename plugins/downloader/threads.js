import { threadsDl } from "../../lib/downloader.js";

export const handler = 'tdd'
export const description = 'Threads Video Downloader'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (psn == "") {
        await sock.sendMessage(id, { text: 'linknya ga ada cuk' })
        return
    }
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    try {
        const { downloadUrl: url, author, title } = await threadsDl(psn)
        caption = `${title} By : ${author}`
        await sock.sendMessage(id, { video: { url, caption } })
    } catch (error) {
        await sock.sendMessage(id, { text: 'Gangguan jir,lapor owner biar dibenerin' })

    }
};
