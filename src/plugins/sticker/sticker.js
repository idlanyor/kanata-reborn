import { createSticker, StickerTypes } from "wa-sticker-formatter";

export const description = "Sticker maker";
export const handler = "s"
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

  if (Buffer.isBuffer(attf)) {
    const stickerOption = {
      pack: "Kanata",
      author: "KanataBot",
      type: StickerTypes.ROUNDED,
      quality: 100
    }

    try {
      const generateSticker = await createSticker(attf, stickerOption);
      await sock.sendMessage(id, { sticker: generateSticker }, { quoted: {
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
        } });
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
