import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pluginsDir = path.join(__dirname, '../plugins');

async function loadPlugins(dir) {
    let plugins = {};
    const list = fs.readdirSync(dir);

    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            const subPlugins = await loadPlugins(filePath);
            const folderName = path.basename(filePath);
            if (folderName === 'hidden') {
                console.log(`📂 Subfolder ${folderName} dikecualikan.`);
                continue;
            }
            if (!plugins[folderName]) {
                plugins[folderName] = [];
            }
            Object.entries(subPlugins).forEach(([subFolder, pluginFiles]) => {
                if (!plugins[subFolder]) {
                    plugins[subFolder] = [];
                }
                plugins[subFolder].push(...pluginFiles);
            });
        } else if (file.endsWith('.js')) {
            const { default: plugin, description, handler } = await import(pathToFileURL(filePath).href);
            const folderName = path.basename(path.dirname(filePath));
            if (!plugins[folderName]) {
                plugins[folderName] = [];
            }
            plugins[folderName].push({
                subfolder: folderName,
                file,
                handler: handler || '⚠️ Belum ada handler',
                description: description || 'ℹ️ Belum ada deskripsi',
            });
        }
    }
    return plugins;
}

export async function helpMessage() {
    const plugins = await loadPlugins(pluginsDir);
    let caption = "🌟 Hai, aku Kanata! Berikut daftar perintah yang tersedia:\n\n";
    for (const category in plugins) {
        caption += `📂 *${category.toUpperCase()}*\n`;
        plugins[category].forEach(plugin => {
            caption += `- 🛠 *${plugin.handler}* \n`;
        });
        caption += '\n';
    }
    caption += "Ketik perintah yang kamu butuhkan! 🚀";
    return { caption, plugins };
}
