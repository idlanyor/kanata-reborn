import { getGroupMetadata } from "../../helper/group.js";

export const handler = '~'
export const description = 'Tag semua anggota group secara tersembunyi'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    let teks = `${psn ? psn : ''}`
    const metadata = await getGroupMetadata({ sock, id })
    let memberId = []
    for (let v of metadata.participants) {
        memberId.push(v.id)
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

