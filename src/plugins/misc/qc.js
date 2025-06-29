import axios from "axios";
import { StickerTypes, createSticker } from "wa-sticker-formatter";

export const handler = 'qc';
export const description = 'Make Quoted Chat';
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const colorMap = {
        hitam: "#000000", putih: "#ffffff", merah: "#ff0000", biru: "#0000ff", kuning: "#ffff00",
        hijau: "#00ff00", ijo: "#00ff00", ungu: "#800080", pink: "#ffc0cb", oranye: "#ffa500",
        coklat: "#8b4513", abu: "#808080", pink_pastel: "#ffd1dc", cyan: "#00ffff", toska: "#40e0d0"
    };

    if (!psn) {
        let warnaTersedia = Object.keys(colorMap).map(w => `- ${w}`).join("\n");
        return await m.reply(
            `👉Quoted Chat Maker👈\n\n` +
            `Gunakan perintah:\n` +
            `*qc <teks> --<warna>*\n\n` +
            `📌 *Contoh:*\n` +
            `- qc Halo Dunia --merah\n` +
            `- qc --biru Ini teksnya\n\n` +
            `🎨 *Warna Tersedia:*\n${warnaTersedia}`);
    }

    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });

    if (psn.length > 10000) return sock.sendMessage(id, { text: "Maksimal 10000 karakter?" });

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
    const encodedText = encodeURIComponent(psn);
    const encodedName = encodeURIComponent(m.pushName || "User");
    const encodedBg = encodeURIComponent(bgColor);

    let profilePic = await sock.profilePictureUrl(id, "image")
        .catch(() => globalThis.hikaru.baseUrl + "file/v2/CYOz4sa.jpg");
    const encodedAvatar = encodeURIComponent(profilePic);

    const apiUrl = globalThis.hikaru.baseUrl + `maker/quotly?name=${encodedName}&text=${encodedText}&avatar=${encodedAvatar}&bgColor=${encodedBg}`;

    try {
        const { data: imageBuffer } = await axios.get(apiUrl, {
            responseType: "arraybuffer",
            headers: { 
                accept: "image/png",
                'x-api-key': globalThis.hikaru.apiKey
            }
        });

        const stickerOption = {
            pack: "Kanata Bot",
            author: "wa.me/628157695152",
            type: StickerTypes.FULL,
            quality: 100
        };

        const generateSticker = await createSticker(imageBuffer, stickerOption);
        await sock.sendMessage(id, { sticker: generateSticker }, { quoted: m });
        sock.sendMessage(id, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.log('Error creating sticker:', error);
        await sock.sendMessage(id, { text: `Gagal bikin stiker\nReason:\n${error}` });
    }
};
