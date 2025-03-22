import { getGroupMetadata } from "../../helper/group.js";

export const handler = 'tagall'
export const description = 'Tag semua anggota group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    let teks = `${psn ? psn : ' '}\n\n`
    const metadata = await getGroupMetadata({ sock, id })
    for (let v of metadata.participants) {
        teks += `@${v.id.split('@')[0]}\n`
    };
    await sock.sendMessage(id, { text: teks, mentions: memberId }, { quoted: {
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
        } })
}

