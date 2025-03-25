import { readFile, writeFile } from "fs/promises"
import { ryzenNime } from "./__axios.js"
import cron from 'node-cron'

const GenreDatabase = 'src/database/anime/genrelist.json'
const readGenreDatabase = await readFile(GenreDatabase, "utf-8")
const data = JSON.parse(readGenreDatabase)


export async function fetchGenreList() {
    try {
        const { data } = await ryzenNime('genre');
        if (!data) throw new Error(`HTTP error! Status: ${response.status}`);

        await writeFile(GenreDatabase, JSON.stringify(data, null, 2));
        console.log(`Genre List updated: ${new Date().toISOString()}`);
    } catch (error) {
        console.error('Failed to fetch Genre List:', error);
    }
}
// cron.schedule('0 0 */28 * *', fetchGenreList);
// fetchGenreList();
// console.log(data)
