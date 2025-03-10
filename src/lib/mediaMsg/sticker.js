import { StickerTypes, createSticker } from "wa-sticker-formatter"
import { getMedia } from "../../helper/mediaMsg.js";

export default async function sticker(sock, m, chatUpdate) {
    if (chatUpdate.messages[0].message?.imageMessage?.caption == 's' && chatUpdate.messages[0].message?.imageMessage) {
        const mediaData = await getMedia(m)
        if (!mediaData) {
            console.log('Media data not found');
            return;
        }

        const stickerOption = {
            pack: "Kanata",
            author: "KanataBot",
            type: StickerTypes.FULL,
            quality: 100,
        }
        try {
            const generateSticker = await createSticker(mediaData, stickerOption);
            await sock.sendMessage(m.key.remoteJid, { sticker: generateSticker })
        } catch (error) {
            console.log('Error creating sticker:', error);
            await sock.sendMessage(m.key.remoteJid, { text: `Error creating sticker\n Reason :\n ${error}` })
        }
    }
}