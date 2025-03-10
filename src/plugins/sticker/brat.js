import { StickerTypes, createSticker } from "wa-sticker-formatter";

export const handler = 'brat'
export const description = 'Brat Generator'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const { url } = await fetch(`https://brat.caliphdev.com/api/brat?text=${psn}`)
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
    } catch (error) {
        console.log('Error creating sticker:', error);
        await sock.sendMessage(id, { text: `Error creating bratt\n Reason :\n ${error}` })
    }
};
