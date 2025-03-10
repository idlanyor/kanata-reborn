import puppeteer from 'puppeteer';

export const capcutDl = async (url) => {
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

        // Buka tab baru
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

        // Buka website
        await page.goto('https://3bic.com/id', {
            waitUntil: 'networkidle0'
        });

        await page.type('#text_input', url);

        await page.click('#submit');

        await page.waitForSelector('.result_overlay', {
            timeout: 30000
        });

        const result = await page.evaluate(() => {
            const downloadLink = document.querySelector('.download_link')?.href;
            const title = document.querySelector('.result_overlay h2')?.textContent?.trim() || '';
            const description = document.querySelector('.result_overlay b')?.textContent?.trim() || '';
            const thumbnail = document.querySelector('.result_overlay')?.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1') || '';
            
            return {
                downloadLink,
                title,
                description,
                thumbnail
            };
        });

        await browser.close();

        if (!result || !result.downloadLink) {
            return {
                status: false,
                message: "No download link found for the given CapCut URL",
                data: null,
                error: "Content not found"
            };
        }

        return {
            status: true,
            message: "Success scraping CapCut template",
            data: {
                title: result.title || "Untitled Template",
                description: result.description || "No Description",
                thumbnail: result.thumbnail,
                downloadUrl: result.downloadLink
            },
            error: null
        };

    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape CapCut template",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     try {
//         const result = await scrapeCapCut('https://www.capcut.com/t/Zs8yP9ycY/');
//         console.log(result);
//     } catch (error) {
//         console.error(error);
//     }
// })();
