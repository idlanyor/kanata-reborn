// Function Registry untuk menyimpan dan mengelola semua fungsi yang tersedia
class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.functionDescriptions = new Map();
    }

    // Mendaftarkan fungsi baru
    register(name, fn, description, parameters = []) {
        this.functions.set(name, fn);
        this.functionDescriptions.set(name, {
            name,
            description,
            parameters
        });
    }

    // Mendapatkan fungsi berdasarkan nama
    get(name) {
        return this.functions.get(name);
    }

    // Mendapatkan deskripsi fungsi untuk Gemini AI
    getFunctionDescriptions() {
        return Array.from(this.functionDescriptions.values());
    }

    // Eksekusi fungsi berdasarkan nama dan parameter
    async execute(name, params, context) {
        const fn = this.functions.get(name);
        if (!fn) {
            throw new Error(`Function ${name} not found`);
        }
        return await fn(params, context);
    }
}

// Membuat instance global
const registry = new FunctionRegistry();

// Contoh cara mendaftarkan fungsi downloader
registry.register(
    'downloadInstagram',
    async (params, context) => {
        // Implementasi fungsi download Instagram
        const { url } = params;
        // ... logika download
    },
    'Download video atau foto dari Instagram',
    [{
        name: 'url',
        type: 'string',
        description: 'URL Instagram yang akan diunduh'
    }]
);

export default registry; 