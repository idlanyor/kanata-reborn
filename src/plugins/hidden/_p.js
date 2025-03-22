import loadAssets from "../../helper/loadAssets.js";

export const handler = ['p', 'oy']
export const description = 'p'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    await sock.sendMessage(id, { audio: { url: await loadAssets('sad-meow-song.mp3', 'voice') }, mimetype: 'audio/mp4', fileName: "anjay" }, { quoted: {
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
};
