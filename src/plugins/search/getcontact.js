// tqto Hikaru - FastUrl
import axios from "axios";
export const handler = 'getcontact'
export const description = 'Retrieve Tags & User Information From Getcontact'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) return await sock.sendMessage(id, { text: 'Silahkan Masukkan nomor telepon dengan format `.getcontact 62xxxx`' })
    
    // Format nomor telepon
    let formattedNumber = psn
    if (psn.startsWith('@')) {
        formattedNumber = psn.substring(1)
    }
    if (psn.startsWith('08')) {
        formattedNumber = '62' + psn.substring(1)
    }
    
    const base = `https://fastrestapis.fasturl.cloud/tool/getcontact?number=${formattedNumber}`

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
