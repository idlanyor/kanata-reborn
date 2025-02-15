import { checkOwner } from '../../helper/permission.js';
import util from 'util';

export default async ({ sock, m, id, noTel, psn,sender }) => {
    if (!await checkOwner(sock, id, noTel)) return;
    
    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan kode yang akan dieval!' });
        return;
    }

    try {
        // Buat context untuk eval
        const context = {
            sock,
            m,
            id,
            sender,
            noTel,
            psn,
            console: {
                ...console,
                log: (...args) => {
                    sock.sendMessage(id, { 
                        text: `📤 *CONSOLE.LOG*\n\n${args.join(' ')}`
                    });
                }
            }
        };

        // Tambahkan try-catch dalam kode yang dieval
        let code = psn;
        if (!code.includes('return')) {
            if (!code.includes(';')) code = 'return ' + code;
        }
        code = `(async () => { try { ${code} } catch(e) { return e } })()`;

        // Eval kode
        const result = await eval(code);
        let output;

        // Format output
        if (result?.stack) {
            output = `❌ *ERROR*\n\n${result.stack}`;
        } else {
            output = `✅ *RESULT*\n\n`;
            if (typeof result === 'string') output += result;
            else if (typeof result === 'number') output += result.toString();
            else if (typeof result === 'object') output += JSON.stringify(result, null, 2);
            else if (typeof result === 'boolean') output += result ? 'true' : 'false';
            else if (result === undefined) output += 'undefined';
            else if (result === null) output += 'null';
            else output += util.format(result);
        }

        await sock.sendMessage(id, { text: output });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ *ERROR*\n\n${error.stack}`
        });
    }
};

export const handler = ['>','eval'];
export const tags = ['owner'];
export const command = ['>', 'eval'];
export const help = 'Mengevaluasi kode JavaScript'; 