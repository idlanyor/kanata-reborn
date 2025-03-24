import loadAssets from "../../helper/loadAssets.js";

export const handler = ['p', 'oy']
export const description = 'p'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    await sock.sendMessage(id, { audio: { url: await loadAssets('sad-meow-song.mp3', 'voice') }, mimetype: 'audio/mpeg', fileName: "anjay" }, { quoted:m });
};
