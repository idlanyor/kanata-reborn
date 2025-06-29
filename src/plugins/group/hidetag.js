import { getGroupMetadata } from "../../helper/group.js";

export const handler = 'ht'
export const description = 'Tag semua anggota group secara tersembunyi'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!m.isAdmin) return m.reply('Access Denied \nCommand Khusus Admin')
    let teks = `${psn ? psn : ''}`
    const metadata = await getGroupMetadata({ sock, id })
    let memberId = []
    for (let v of metadata.participants) {
        memberId.push(v.id)
    };
    await sock.sendMessage(id, { text: teks, mentions: memberId }, { quoted:m })
}

