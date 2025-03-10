import { Router } from 'express';
import { join } from 'path';
import { loadPlugins } from '../utils/pluginLoader.js';
import { __dirname } from '../config/server.js';

const router = Router();

// Route untuk dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(join(__dirname, '../public', 'dashboard.html'));
});

// Route untuk halaman utama
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 min-h-screen flex items-center justify-center">
            <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h1 class="text-3xl font-bold text-white mb-6 text-center">Login Kanata Base</h1>
                <form class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2" for="username">Username</label>
                        <input type="text" id="username" name="username" 
                            class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                            required>
                    </div>
                    <div>
                        <label class="block text-gray-300 mb-2" for="password">Password</label>
                        <input type="password" id="password" name="password"
                            class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                            required>
                    </div>
                    <button type="submit" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                        Login
                    </button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Route untuk daftar plugin
router.get('/plugins/list', async (req, res) => {
    try {
        const pluginsDir = join(__dirname, '../plugins');
        const plugins = await loadPlugins(pluginsDir);

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <title>Daftar Plugin</title>
                <script>
                    tailwind.config = {
                        darkMode: 'class'
                    }
                </script>
            </head>
            <body class="bg-gray-900 text-gray-100">
                <div class="container mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold text-gray-100 mb-6">Daftar Plugin</h1>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${plugins.map(plugin => `
                            <div class="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 cursor-pointer border border-gray-700" 
                                 onclick="window.location.href='/plugins/detail/${encodeURIComponent(plugin.path)}'">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-xl font-semibold text-gray-100">${plugin.handler}</h2>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" class="sr-only peer" ${plugin.isActive ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <p class="text-gray-400 mb-3">${plugin.description}</p>
                                <div class="text-sm text-gray-500">Path: ${plugin.path}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <script>
                    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        checkbox.addEventListener('change', function(e) {
                            e.stopPropagation();
                            console.log('Plugin status changed:', this.checked);
                        });
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Gagal mendapatkan daftar plugin",
            error: error.message
        });
    }
});

export default router; 