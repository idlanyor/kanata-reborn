/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Instagram Video & Image Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const igDl = async (url) => {
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
        await page.goto('https://igsaved.app/en', { waitUntil: 'networkidle2' });

        const inputSelector = '#s_input';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '.input-group-btn .btn.btn-default';
        await page.click(submitButtonSelector);

        const resultSelector = '#search-result';
        await page.waitForSelector(resultSelector, { visible: true });

        const data = await page.evaluate(() => {
            const item = document.querySelector("#search-result .download-items");
            if (!item) return null;

            const thumbnail = item.querySelector(".download-items__thumb img")?.src || null;
            const videoLink = item.querySelector(".download-items__btn a[title='Download Video']")?.href || null;
            const imageLink = item.querySelector(".download-items__btn a[title='Download Thumbnail']")?.href || null;

            return { thumbnail, videoLink, imageLink };
        });

        await browser.close();
        
        if (!data) {
            return {
                status: false,
                message: "No content found for the given Instagram URL",
                data: null,
                error: "Content not found"
            };
        }

        return {
            status: true,
            message: "Success scraping Instagram content",
            data: {
                thumbnail: data.thumbnail,
                videoUrl: data.videoLink,
                imageUrl: data.imageLink
            },
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape Instagram content",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     await igDl('https://www.instagram.com/reel/DF4oOlavxSq/?igsh=MWRxMDF1N3Z6dnl4OQ==')
// })()
