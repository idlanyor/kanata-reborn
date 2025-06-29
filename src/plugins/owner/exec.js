import { checkOwner } from '../../helper/permission.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export default async ({ sock, m, id, noTel, psn }) => {

    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan perintah yang akan dieksekusi!' });
        return;
    }

    try {
        const { stdout, stderr } = await execAsync(psn);
        let result = '';

        if (stdout) result += `📤 *STDOUT*\n\n${stdout}\n`;
        if (stderr) result += `⚠️ *STDERR*\n\n${stderr}\n`;

        if (!result) result = '✅ Executed with no output';

        await sock.sendMessage(id, { text: result });
    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ *ERROR*\n\n${error.message}`
        });
    }
};

export const handler = ['#', 'x', '.'];
export const tags = ['owner'];
export const command = ['#', 'exec'];
export const help = 'Mengeksekusi perintah shell'; 