import { checkOwner } from '../../helper/permission.js';
import util from 'util';

export default async ({ sock, m, id, noTel, psn, sender }) => {
    if (!globalThis.isOwner(noTel)) return;

    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan kode yang akan dieval!' });
        return;
    }

    try {

        // Buat context untuk eval
        const evalCode = psn;
        const context = {
            sock, m, id: m.chat, sender, noTel,
            console: {
                ...console,
                log: (...args) => {
                    sock.sendMessage(m.chat, {
                        text: `📤 *CONSOLE.LOG*\n\n${args.join(' ')}`
                    });
                }
            }
        };

        // Format kode
        let code = evalCode;
        if (!code.includes('return')) {
            if (!code.includes(';')) code = 'return ' + code;
        }
        code = `(async () => { try { ${code} } catch(e) { return e } })()`;

        // Eval kode
        const result = await eval(code);
        let output = '✅ *RESULT*\n\n';

        if (result?.stack) {
            output = `❌ *ERROR*\n\n${result.stack}`;
        } else if (typeof result === 'string') {
            output += result;
        } else if (typeof result === 'object') {
            output += JSON.stringify(result, null, 2);
        } else {
            output += util.format(result);
        }

        await m.reply(output);
    } catch (error) {
        await m.reply(`❌ *ERROR*\n\n${error.stack}`);
    }
};

export const handler = ['...', 'eval'];
export const tags = ['owner'];
export const command = ['>', 'eval'];
export const help = 'Mengevaluasi kode JavaScript'; 