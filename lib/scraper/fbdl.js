/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Facebook Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const fbdl = async (url) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });
        await page.goto('https://snapsave.app/id', { waitUntil: 'networkidle2' });

        const inputSelector = '#url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#send';
        await page.click(submitButtonSelector);

        const resultSelector = '#download-section';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(async () => {
            const title = document.querySelector('.media-content .content p strong')?.textContent;
            const thumbnail = document.querySelector('.media-left img')?.getAttribute('src');
            const downloadLinks = Array.from(
                document.querySelectorAll('.table tbody tr')
            ).map(row => {
                const quality = row.querySelector('.video-quality')?.textContent;
                const url = row.querySelector('a')?.getAttribute('href');
                return { quality, url };
            });

            return { title, thumbnail, downloadLinks };
        });

        await browser.close();

        if (!result || !result.downloadLinks || result.downloadLinks.length === 0) {
            return {
                status: false,
                message: "No download links found for the given Facebook URL",
                data: null,
                error: "Content not found"
            };
        }

        return {
            status: true,
            message: "Success scraping Facebook video",
            data: {
                title: result.title || "Untitled",
                thumbnail: result.thumbnail,
                downloads: result.downloadLinks
            },
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape Facebook video",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     console.log(await fbdl('https://www.facebook.com/share/v/1KZMzwPtuz/'))
// })()

