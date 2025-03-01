import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

export const description = "Download repository GitHub";
export const handler = "gitclone";

export default async ({ sock, m, id, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { 
                text: `⚠️ Masukkan URL repository GitHub!\n\nContoh: !gitclone https://github.com/username/repo` 
            });
            return;
        }

        // Validasi URL GitHub
        const githubRegex = /^https?:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;
        if (!githubRegex.test(psn)) {
            await sock.sendMessage(id, { 
                text: '❌ URL GitHub tidak valid!' 
            });
            return;
        }

        await sock.sendMessage(id, { 
            text: '⏳ Sedang mengunduh repository...' 
        });

        // Ambil info repository
        const repoUrl = psn;
        const apiUrl = repoUrl.replace('github.com', 'api.github.com/repos');
        
        const { data: repoInfo } = await axios.get(apiUrl);
        
        // Buat nama file zip
        const repoName = repoInfo.name;
        const zipUrl = `${repoUrl}/archive/refs/heads/${repoInfo.default_branch}.zip`;
        const downloadPath = path.join(__dirname, '../../temp');
        
        // Buat folder temp jika belum ada
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath, { recursive: true });
        }

        const zipPath = path.join(downloadPath, `${repoName}.zip`);

        // Download zip file
        const response = await axios({
            method: 'GET',
            url: zipUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Kirim file
        await sock.sendMessage(id, {
            document: fs.readFileSync(zipPath),
            fileName: `${repoName}.zip`,
            mimetype: 'application/zip',
            caption: `📦 *Repository GitHub*\n\n` +
                    `📝 Nama: ${repoInfo.name}\n` +
                    `👤 Owner: ${repoInfo.owner.login}\n` +
                    `⭐ Stars: ${repoInfo.stargazers_count}\n` +
                    `📚 Description: ${repoInfo.description || '-'}\n` +
                    `🔗 URL: ${repoInfo.html_url}`
        });

        // Hapus file zip
        fs.unlinkSync(zipPath);

    } catch (error) {
        console.error('Error in gitclone:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan: ${error.message}` 
        });
    }
}; 