// tqto Hikaru - FastUrl
import axios from "axios";
export const handler = 'getcontact'
export const description = 'Retrieve Tags & User Information From Getcontact'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) return await sock.sendMessage(id, { text: 'Silahkan Masukkan nomor telepon' })
    const base = `https://fastrestapis.fasturl.cloud/tool/getcontact?number=${psn}`

    const { data } = await axios.get(base)
    const text = `
User Data:
- Name: ${data.result.userData.name}
- Phone: ${data.result.userData.phone}
- Provider: ${data.result.userData.provider}

Tags:
- ${data.result.tags.join('\n- ')}
`;
    await sock.sendMessage(id, { text })

};
