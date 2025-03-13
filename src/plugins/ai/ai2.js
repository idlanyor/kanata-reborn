import { hikaru } from "../../helper/hikaru.js";
export const description = "AI GPT 4o-mini provided by *FastURL*";
export const handler = "ai2"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    try {
        if (psn === '') {
            sock.sendMessage(id, {
                text: "prefix *ai2* Tanyakan sesuatu kepada AI 2\n contoh : ai2 siapa presiden indonesia saat ini"
            })
            return
        }
        let { data } = await hikaru('aillm/gpt-4o-mini', {
            params: {
                ask: psn
            }
        })

        await sock.sendMessage(id, {
            text: data.result
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ *Ups, AI nya error guys*:\n${error.message}` });
    }
    // await sock.sendMessage(id, { text: `AI-nya lagi mantenan guys,belum bisa dipake,xD` });

};
