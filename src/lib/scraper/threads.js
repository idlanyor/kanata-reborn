/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Threads Downloader
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */

import puppeteer from 'puppeteer';

export const threads = async (link) => {
    try {
        const id = link.match(/\/post\/([^?\/]+)/);
        if (!id || !id[1]) {
            return {
                status: false,
                message: "Invalid Threads URL format", 
                data: null,
                error: "Could not extract post ID"
            };
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        
        await page.goto(`https://threadster.app/download/${id[1]}`, {
            waitUntil: 'networkidle0'
        });

        const data = await page.evaluate(() => {
            const title = document.querySelector('.download__item__caption__text')?.textContent?.trim() || 'No Caption';
            const author = document.querySelector('.download__item__profile_pic div span')?.textContent?.trim() || 'Unknown Author';
            const downloadUrl = document.querySelector('.download__item__info__actions__button')?.getAttribute('href');

            return {
                title,
                author,
                downloadUrl
            };
        });

        await browser.close();

        if (!data.downloadUrl) {
            return {
                status: false,
                message: "Content not found or has been removed",
                data: null,
                error: "Download URL not found"
            };
        }

        return {
            status: true,
            message: "Success scraping Threads content",
            data: {
                title: data.title,
                author: data.author,
                downloadUrl: data.downloadUrl
            },
            error: null
        };

    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape Threads content",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     try {
//         const result = await threads('https://www.threads.net/@budikuang/post/DFDaS9UyhbJ?xmt=AQGzTcf8Jg0MTzaOE7JWGSYs5EyzaAcIrlfk9-z635Texw');
//         console.log(result);
//     } catch (error) {
//         console.error("Error:", error.message);
//     }
// })();
