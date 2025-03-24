import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export const ytVideo2 = async (url) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://en1.savefrom.net/1-youtube-video-downloader-7ON/', { waitUntil: 'networkidle2' });
    
    await page.screenshot({ path: 'debug.png' }); // Cek apakah halaman benar-benar terbuka

    const inputSelector = '#sf_url';
    // if (await page.$(inputSelector) === null) {
    //     console.log('Selector tidak ditemukan, kemungkinan situs memblokir bot.');
    //     await browser.close();
    //     return { status: false, message: 'Selector not found', data: null };
    // }

    await page.type(inputSelector, url);
    await page.click('#sf_submit');

    await page.waitForSelector('.media-result', { visible: true, timeout: 60000 });

    const result = await page.evaluate(() => {
        const video = document.querySelector('.media-result .result-box.video');
        if (!video) return null;
        return {
            title: video.querySelector('.row.title')?.textContent.trim(),
            url: video.querySelector('.link-download')?.getAttribute('href')
        };
    });

    await browser.close();
    return { status: true, data: result };
};

(async () => {
    console.log(await ytVideo2('https://www.youtube.com/watch?v=e-ORhEE9VVg'));
})();
