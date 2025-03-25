import { readFile, writeFile } from "fs/promises"
import { ryzenNime } from "./__axios.js"
import cron from 'node-cron'

const ScheduleDatabase = 'src/database/anime/jadwal.json'
const readScheduleDatabase = await readFile(ScheduleDatabase, "utf-8")
const data = JSON.parse(readScheduleDatabase)


export async function fetchAnimeBySlug(slug) {
    try {
        const { data } = await ryzenNime(`anime/${slug}`);
        if (!data) throw new Error(`HTTP error!`);

       return data
    } catch (error) {
        console.error('Failed to fetch Anime Schedule:', error);
    }
}
// cron.schedule('0 0 */28 * *', fetchAnimeBySlug);
// fetchAnimeBySlug();
// console.log(await fetchAnimeBySlug('sakamoto-day-sub-indo'))

export async function searchAnime({ type, genre, search, page }) {
    try {
        const { data } = await ryzenNime('anime', {
            params: {
                type, genre, search, page
            }
        });
        if (!data) throw new Error(`HTTP error!`);

        return data
    } catch (error) {
        console.error('Failed to fetch Anime Schedule:', error);
    }
}
// cron.schedule('0 0 */28 * *', searchAnime);
// searchAnime();
// console.log(await searchAnime({ search: 'sakamoto' }))

export async function getEpisodeBySlug(slug) {
    try {
        const { data } = await ryzenNime(`episode/${slug}`);
        if (!data) throw new Error(`HTTP error!`);

        return data
    } catch (error) {
        console.error('Failed to fetch Anime Schedule:', error);
    }
}
// cron.schedule('0 0 */28 * *', getEpisodeBySlug);
// getEpisodeBySlug('sd-episode-1-sub-indo');
// console.log(await getEpisodeBySlug('sd-episode-1-sub-indo'))
