import { readFile, writeFile } from "fs/promises"
import { ryzenNime } from "./__axios.js"
import cron from 'node-cron'

const ScheduleDatabase = 'src/database/anime/jadwal.json'
const readScheduleDatabase = await readFile(ScheduleDatabase, "utf-8")
const data = JSON.parse(readScheduleDatabase)


export async function fetchJadwal() {
    try {
        const { data } = await ryzenNime('jadwal');
        if (!data) throw new Error(`HTTP error! Status: ${response.status}`);

        await writeFile(ScheduleDatabase, JSON.stringify(data, null, 2));
        console.log(`Anime Schedule updated: ${new Date().toISOString()}`);
    } catch (error) {
        console.error('Failed to fetch Anime Schedule:', error);
    }
}
// cron.schedule('0 0 */28 * *', fetchJadwal);
// fetchJadwal();
// console.log(data)
