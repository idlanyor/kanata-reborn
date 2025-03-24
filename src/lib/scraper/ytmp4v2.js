/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Youtube Video Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';


export const ytVideo2 = async (url) => {
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


        await page.goto('https://en1.savefrom.net/1-youtube-video-downloader-7ON/', { waitUntil: 'networkidle0' });

        const inputSelector = '#sf_url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#sf_submit';
        await page.click(submitButtonSelector);

        const resultSelector = '.media-result';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(() => {
            const video = document.querySelector('.media-result .result-box.video');
            if (!video) return null;

            const title = video.querySelector('.row.title')?.textContent.trim();
            const thumbnail = video.querySelector('.thumb-box img.thumb')?.getAttribute('src');
            const duration = video.querySelector('.row.duration')?.textContent.trim();
            const downloadLinks = Array.from(video.querySelectorAll('.link-box .link-download')).map(link => ({
                quality: link.getAttribute('data-quality'),
                type: link.getAttribute('data-type'),
                url: link.getAttribute('href')
            }));

            return { title, thumbnail, duration, downloadLinks };
        });
        await browser.close();

        if (!result) {
            return {
                status: false,
                message: "No download links found for the given YouTube URL",
                data: null,
                error: "Content not found"
            };
        }

        return {
            status: true,
            message: "Success scraping YouTube video",
            data: result,
            error: null
        };

    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape YouTube video",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     console.log((await ytVideo2('https://www.youtube.com/watch?v=e-ORhEE9VVg')).data)
// })()
