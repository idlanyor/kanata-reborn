/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Youtube Shorts Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const ytShorts = async (url) => {
    // try {
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
    await page.goto('https://shortsnoob.com/en1', { waitUntil: 'networkidle2' });

    const inputSelector = '#url';
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, url);

    const submitButtonSelector = '#start';
    await page.click(submitButtonSelector);

    const resultSelector = '#result';
    await page.waitForSelector(resultSelector, { visible: true });

    const result = await page.evaluate(async () => {

        const title = document.querySelector('video p')?.textContent('p');
        const videoSrc = document.querySelector('video source')?.getAttribute('src');
        const downloadLinks = Array.from(
            document.querySelectorAll('.download-table a')
        ).map((a) => a.href);

        return { title, videoSrc, downloadLinks };
    });


    await browser.close();
    console.log(result)
    return result;
    // } catch (error) {
    //     throw new Error('Terjadi error saat scraping:', error)
    // }
};

// (async () => {
//     await ytShorts('https://www.youtube.com/shorts/CCmY6cvTBG4')
// })()

