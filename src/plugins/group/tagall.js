import { getGroupMetadata } from "../../helper/group.js";

export const handler = 'tagall'
export const description = 'Tag semua anggota group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    let teks = `${psn ? psn : ' '}\n\n`
    let memberId = []
    const metadata = await getGroupMetadata({ sock, id })
    for (let v of metadata.participants) {
        const jid = v.id
        teks += `@${v.id.split('@')[0]}\n`
        memberId.push(jid)
    };
    await sock.sendMessage(id, { text: teks, mentions: memberId }, { quoted:m })
}

