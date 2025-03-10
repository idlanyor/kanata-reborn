
export const handler = 'deepseek'
export const description = "Deepseek AI Provided by Ryzendesu";
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *deepseek* Tanyakan sesuatu kepada AI DeepSeek\n contoh : deepseek What is Quantum Physics mean?"

        })
        return
    }
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    try {
        const prompt = "be a helpfull assistant"
        const response = await fetch(`https://api.ryzendesu.vip/api/ai/deepseek?text=${psn}&prompt=${prompt}`);

        const data = await response.json();


        await sock.sendMessage(id, { text: data.answer });
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
    } catch (error) {
        console.error("Error:", error);
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } })
    }


};
