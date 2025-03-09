/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pinterest Search
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */
import puppeteer from 'puppeteer';

export const pinterest = async (q) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.goto(`https://www.pinterest.com/search/pins/?q=${q}`, { waitUntil: 'networkidle0' });

        await page.waitForSelector('div[data-test-id="pin"]');

        const scrollTimes = 5;
        for (let i = 0; i < scrollTimes; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(1000); // Add small delay for content to load
        }

        const pins = await page.evaluate(() => {
            const pinElements = document.querySelectorAll('div[data-test-id="pin"]');
            const pinData = [];
            pinElements.forEach((element) => {
                const titleElement = element.querySelector('img');
                const imageElement = element.querySelector('img');
                const title = titleElement ? titleElement.alt : 'No Title';
                const image = imageElement ? imageElement.src : null;
                if (image) {
                    pinData.push({ title, image });
                }
            });
            return pinData;
        });

        await browser.close();

        if (!pins || pins.length === 0) {
            return {
                status: false,
                message: "No Pinterest pins found for the given query",
                data: null,
                error: "No results found"
            };
        }

        return {
            status: true,
            message: "Success fetching Pinterest pins",
            data: {
                query: q,
                total: pins.length,
                results: pins
            },
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch Pinterest pins",
            data: null,
            error: error.message
        };
    }
};

// (async () => { console.log(await pinSearch('anime ghibli')) })()
