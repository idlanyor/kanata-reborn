import { getBuffer } from "../../helper/mediaMsg.js";
export const handler = 'tesloc'
export const description = ''
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(m.chat, {
        location: {
            degreesLatitude: -7.232864501671495, // Ganti dengan latitude lokasi
            degreesLongitude: 109.33847051113844, // Ganti dengan longitude lokasi
        },
        caption: "Ini adalah lokasi yang dikirim.",
        footer: "© Kanata",
        buttons: [
            {
                buttonId: `🚀`,
                buttonText: {
                    displayText: '🗿'
                },
                type: 1
            }
        ], // isi buttons nya
        headerType: 6,
        viewOnce: true
    }, { quoted:m });
};
