import { createSticker, StickerTypes } from "wa-sticker-formatter";

export const description = "Sticker maker";
export const handler = "s"
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

  if (Buffer.isBuffer(attf)) {
    const stickerOption = {
      pack: "Kanata",
      author: "KanataBot",
      type: StickerTypes.FULL,
      quality: 100
    }

    try {
      const generateSticker = await createSticker(attf, stickerOption);
      await sock.sendMessage(id, { sticker: generateSticker }, { quoted: m });
    } catch (error) {
      console.log('Error creating sticker:', error);
      await sock.sendMessage(id, { text: `Error creating sticker\n Reason :\n ${error}` });
    }

    return
  }
  // else {
  //   console.log('Media data not found');
  if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
    return
  };
  //   await sock.sendMessage(id, { text: 'Kirim/reply gambar dengan caption s' });
  // }
  await sock.sendMessage(id, { text: 'Kirim/reply gambar dengan caption s' });
};
