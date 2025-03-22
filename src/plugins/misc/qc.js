import axios from "axios";
import { StickerTypes, createSticker } from "wa-sticker-formatter";

export const handler = 'qc'
export const description = 'Make Quoted Chat'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const colorMap = {
        hitam: "#000000", putih: "#ffffff", merah: "#ff0000", biru: "#0000ff", kuning: "#ffff00",
        hijau: "#00ff00", ijo: "#00ff00", ungu: "#800080", pink: "#ffc0cb", oranye: "#ffa500",
        coklat: "#8b4513", abu: "#808080", pink_pastel: "#ffd1dc", cyan: "#00ffff", toska: "#40e0d0"
    };
    if (!psn) {
        let warnaTersedia = Object.keys(colorMap).map(w => `- ${w}`).join("\n");
        return await sock.sendMessage(id, {
            text:
                `👉Quoted Chat Maker👈\n\n` +
                `Gunakan perintah:\n` +
                `*qc <teks> --<warna>*\n\n` +
                `📌 *Contoh:*\n` +
                `- qc Halo Dunia --merah\n` +
                `- qc --biru Ini teksnya\n\n` +
                `🎨 *Warna Tersedia:*\n${warnaTersedia}`
        });
    }
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })

    if (psn.length > 10000) return sock.sendMessage(id, { text: "Maksimal 10000 karakter?" })
    let words = psn.split(" ");
    let bgColor = "#000000";

    if (words[0].startsWith("--") && colorMap[words[0].slice(2).toLowerCase()]) {
        bgColor = colorMap[words[0].slice(2).toLowerCase()];
        words.shift();
    } else if (words[words.length - 1].startsWith("--") && colorMap[words[words.length - 1].slice(2).toLowerCase()]) {
        bgColor = colorMap[words[words.length - 1].slice(2).toLowerCase()];
        words.pop();
    }

    psn = words.join(" ");

    let profilePic = await sock.profilePictureUrl(id, "image").catch(() => "https://fastrestapis.fasturl.cloud/file/v2/CYOz4sa.jpg");
    const payload = {
        type: "quote",
        format: "png",
        backgroundColor: bgColor,
        width: 512,
        height: 800,
        scale: 2,
        messages: [{
            entities: [],
            avatar: true,
            from: { id: 1, name: m.pushName, photo: { url: profilePic } },
            text: psn,
            replyMessage: {}
        }]
    };
    const { data } = await axios.post("https://quotly.netorare.codes/generate", payload);
    const imageBuffer = Buffer.from(data.result.image, "base64");
    const stickerOption = {
        pack: "Kanata",
        author: "Roy",
        type: StickerTypes.FULL,
        quality: 100
    }

    try {
        const generateSticker = await createSticker(imageBuffer, stickerOption);
        await sock.sendMessage(id, { sticker: generateSticker }, { quoted:m });
        sock.sendMessage(id, { react: { text: '✅', key: m.key } })

    } catch (error) {
        console.log('Error creating sticker:', error);
        await sock.sendMessage(id, { text: `Error creating sticker\n Reason :\n ${error}` });
    }
};
