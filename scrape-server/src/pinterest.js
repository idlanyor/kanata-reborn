/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pinterest Search
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */
import puppeteer from 'puppeteer';

export const pinterest = async (q) => {
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
    }

    const pins = await page.evaluate(() => {
        const pinElements = document.querySelectorAll('div[data-test-id="pin"]');
        const pinData = [];
        pinElements.forEach((element) => {
            const titleElement = element.querySelector('img');
            const imageElement = element.querySelector('img');
            const title = titleElement ? titleElement.alt : 'No Title';
            const image = imageElement ? imageElement.src : 'No Image';
            pinData.push({ title, image });
        });
        return pinData;
    });

    await browser.close();
    return pins;
}

// (async () => { console.log(await pinSearch('anime ghibli')) })()
