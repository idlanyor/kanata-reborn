export const handler = ['ef', 'ex']
export const description = 'Eval(Developer Only))'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf, cmd }) => {
    if (!psn) {
        return sock.sendMessage(id, { text: "No code provided" });
    }
    try {
        let result;
        if (cmd.startsWith("ef")) {
            result = await eval(
                async function run() { `${psn}` },
                run()
            );
        } else if (cmd.startsWith("ex")) {
            result = await eval(psn);
        }

        if (typeof result === "object") {
            result = JSON.stringify(result, null, 2);
        }
        console.log(result?.toString().trim())
        return
        await sock.sendMessage(id, { text: result?.toString().trim() }, { quoted: m })
    } catch (error) {
        throw new Error('Lorems' + error.message);
    }
};
