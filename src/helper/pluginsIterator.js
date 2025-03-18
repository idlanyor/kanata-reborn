import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pluginsDir = path.join(__dirname, '../plugins');

// Deskripsi khusus untuk beberapa plugin agar lebih jelas
const CUSTOM_DESCRIPTIONS = {
    'play': 'Memutar/mendengarkan lagu dari YouTube',
    'yp': 'Memutar/mendengarkan lagu dari YouTube (shortcut)',
    'ytplay': 'Memutar/mendengarkan lagu dari YouTube',
    'lirik': 'Menampilkan lirik lagu (gunakan hanya jika user meminta lirik)',
    'lyrics': 'Menampilkan lirik lagu (gunakan hanya jika user meminta lirik)',
    'spotifysearch': 'Mencari lagu di Spotify'
};

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
            let { default: plugin, description, handler } = await import(pathToFileURL(filePath).href);
            
            // Override deskripsi dengan deskripsi khusus jika ada
            if (handler && CUSTOM_DESCRIPTIONS[handler]) {
                description = CUSTOM_DESCRIPTIONS[handler];
            }
            
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
    return plugins;
}
