import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async function loadAssets(namaFile, folder) {
    const filePath = path.join(__dirname, '../assets', folder, namaFile);
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${namaFile} ora ketemu ning folder ${folder}`);
        }
        // return await fs.promises.readFile(filePath);
        return filePath
    } catch (e) {
        console.error(`Gagal buka file: ${e.message}`);
        throw e;
    }
}
