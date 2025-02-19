import { StickerTypes, createSticker } from "wa-sticker-formatter";

export const handler = 'bratnimevid'
export const description = 'Anime Brat Video Generator'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    const { url } = await fetch(`https://fastrestapis.fasturl.cloud/maker/animbrat?text=${encodeURIComponent(psn)}&mode=animated&position=center`)
    const stickerOption = {
        pack: "KanataBot",
        author: "Roy",
        type: StickerTypes.FULL,
        quality: 100,
    }
    // console.log(data)
    // return
    try {
        const generateSticker = await createSticker(url, stickerOption);
        await sock.sendMessage(id, { sticker: generateSticker })
        sock.sendMessage(id, { react: { text: '✅', key: m.key } })

    } catch (error) {
        console.log('Error creating sticker:', error);
        await sock.sendMessage(id, { text: `Error creating bratt\n Reason :\n ${error}` })
    }
};
