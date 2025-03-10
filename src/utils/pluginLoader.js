import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function findJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findJsFiles(filePath));
        }
        else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

export async function loadPlugins(pluginsDir) {
    const plugins = [];
    const files = findJsFiles(pluginsDir);

    for (const file of files) {
        const relativePath = path.relative(pluginsDir, file);
        const plugin = await import(pathToFileURL(file));

        plugins.push({
            path: relativePath,
            handler: plugin.handler || '',
            description: plugin.description || '',
            function: plugin.exec || '',
            isActive: true
        });
    }

    return plugins;
}

export async function loadPluginCommands(pluginsDir) {
    const plugins = {};
    const files = findJsFiles(pluginsDir);

    await Promise.all(files.map(async file => {
        try {
            const { default: plugin, handler } = await import(pathToFileURL(file).href);
            if (handler) {
                if (Array.isArray(handler)) {
                    // Jika handler adalah array, tambahkan plugin untuk setiap command
                    handler.forEach(cmd => {
                        plugins[cmd] = plugin;
                    });
                } else {
                    // Jika handler adalah string, gunakan sebagai command
                    plugins[handler] = plugin;
                }
            }
        } catch (error) {
            console.error(`Error loading plugin from ${file}:`, error);
        }
    }));

    return plugins;
} 