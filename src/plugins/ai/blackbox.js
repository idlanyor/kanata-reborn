import { hikaru } from "../../helper/hikaru.js";

export const handler = 'blackbox'
export const description = "AI Blackbox provided by *FastURL*";
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *blackbox* Tanyakan sesuatu kepada AI BlackBox\n contoh : !blackbox siapa presiden indonesia saat ini"

        })
        return
    }
    try {
        const { data } = await hikaru('aillm/blackbox', {
            params: {
                ask: psn,
                model: 'blackbox',
            }
        })
        let ingfo = `📌 *Informasi Tambahan:*\n\n`;

        data.additionalInfo.forEach((info, index) => {
            ingfo += `🔹 *${info.title}*\n`;
            ingfo += `📄 ${info.snippet}\n`;
            ingfo += `🔗 *Baca Selengkapnya:* ${info.link}\n`;

            if (info.sitelinks.length > 0) {
                ingfo += `📌 *Tautan Terkait:*\n`;
                info.sitelinks.forEach(site => {
                    ingfo += `   🔗 ${site.title}: ${site.link}\n`;
                });
            }
            ingfo += `\n`;
        });
        // console.log(ingfo.trim())
        await sock.sendMessage(id, { text: data.result }, { quoted: {
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
        await sock.sendMessage(id, { text: ingfo.trim() }, { quoted: {
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
        console.log(error);
        await sock.sendMessage(id, { text: `Terjadi kesalahan di sisi server ${error}` });
    }
};
