import { mixtralGroq } from "../../lib/ai.js";
export const description = "AI Mixtral7B provided by *Mixtral AI*";
export const handler = "mixtral"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "Tanyakan sesuatu kepada mixtral\n prefix *Mixtral* \n contoh : mixtral siapa presiden indonesia saat ini"
        })
        return
    }
    await sock.sendMessage(id, { text: await mixtralGroq(psn) });
};
