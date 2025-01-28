/**
 * @author : Roidev~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Youtube Shorts Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const ytShorts = async (url) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        await page.goto('https://shortsnoob.com/en1', { waitUntil: 'networkidle2' });

        const inputSelector = '#url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#start';
        await page.click(submitButtonSelector);

        const resultSelector = '#result';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(() => {
            const videoSrc = document.querySelector('video source')?.getAttribute('src');
            const downloadLinks = Array.from(
                document.querySelectorAll('.download-table a')
            ).map((a) => a.href);

            return { videoSrc, downloadLinks };
        });


        await browser.close();
        console.log(result)
        return result;
    } catch (error) {
        throw new Error('Terjadi error saat scraping:', error)
    }
};

await ytShorts('https://www.youtube.com/shorts/7F-X7fxeufc');
