import { getGroupMetadata } from "../../helper/group.js";

export const handler = 'tagall'
export const description = 'Tag semua anggota group'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    let teks = `${psn ? psn : ' '}\n\n`
    const metadata = await getGroupMetadata({ sock, id })
    for (let v of metadata.participants) {
        teks += `@${v.id.split('@')[0]}\n`
    };
    await sock.sendMessage(id, { text: teks, mentions: memberId }, { quoted: m })
}

