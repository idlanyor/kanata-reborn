/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Shutterstock Search
 * @module : ES6 Module
 * terinspirasi dari skrep CommonJs Hann404 🙇
 */
import axios from "axios";
import * as cheerio from 'cheerio';

const baseURL = 'https://www.shutterstock.com'
const ssBase = axios.create({
    baseURL,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml",
    }
})

export const shutterstock = async (q) => {
    try {
        const { data } = await ssBase.get(`/id/search/${q}`)
        const skrep = cheerio.load(data)
        const results = [];

        skrep('div[data-automation="AssetGrids_GridItemContainer_div"]').each((index, element) => {
            const anchor = skrep(element).find('a.mui-t7xql4-a-inherit-link');
            const pictureSource = skrep(element).find('picture img');

            const title = anchor.attr('aria-label');
            if (!title) return;
            const link = anchor.attr('href');
            if (!link) return;
            const image = pictureSource.attr('src');
            if (!image) return;

            results.push({ title, link, image });
        });

        return results
    } catch (error) {
        throw new Error(error.message)
    }
}

// Test
// (async () => { console.log(await shutterstockSearch('anime')) })()