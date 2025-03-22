import { getBuffer } from "../../helper/mediaMsg.js";
export const handler = 'tesloc'
export const description = ''
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(m.chat, {
        location: {
            degreesLatitude: -6.2088, // Ganti dengan latitude lokasi
            degreesLongitude: 106.8456, // Ganti dengan longitude lokasi
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
    }, { quoted: {
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
