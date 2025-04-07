import axios from "axios";
import { uploadGambar } from "../../helper/uploader.js";

export const handler = 'toghibli'
export const description = 'Transform Your Image Into Ghibli Style'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        const url = await uploadGambar(attf)
        await m.reply('gambar sedang diproses,silahkan tunggu...\n\n_Fgsi x Kanata_')
        const { data } = await axios.get(`https://fgsi1-restapi.hf.space/api/ai/toGhibli`, {
            params: {
                url
            },
            responseType: 'arraybuffer'
        })
        const imgBuffer = Buffer.from(data)
        await sock.sendMessage(id, { image: imgBuffer, caption: 'Done cik \n\n_Fgsi x Kanata_' }, { quoted: m })
    }
};
