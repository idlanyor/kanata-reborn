/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Tiktok Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const tiktokDl = async (url) => {
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

        await page.goto('https://tiktokdl.app/', { waitUntil: 'networkidle2' });

        const inputSelector = 'input[name="url"]';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '.splash-search-button';
        await page.click(submitButtonSelector);

        // Tunggu hingga elemen result muncul
        await page.waitForSelector('.splash-video-wrapper', { visible: true });

        const video = await page.$$eval('.splash-video a[data-extension="mp4"]', links =>
            links.map(link => ({
                url: link.href,
                size: link.getAttribute('data-size') || 'Unknown'
            })).filter(video => video.size !== 'Unknown')
        );

        const author = await page.$eval('.splash-video h2', el => el.textContent.trim());
        const audio = await page.$eval('.splash-video a[data-extension="mp3"]', el => el.href);
        const caption = await page.$eval('.splash-video p', el => el.textContent.trim());

        await browser.close();
        return { caption, author, video, audio };
    } catch (error) {
        throw new Error('Terjadi error saat scraping:', error)
    }
};

// (async () => {
//     console.log(await tiktokDl('https://www.tiktok.com/@tewut_ba/video/7466835019667885317?q=kusangatsuka&t=1738897907485'))
// })()

