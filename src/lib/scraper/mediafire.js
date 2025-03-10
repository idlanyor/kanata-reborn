import puppeteer from 'puppeteer';

/**
 * Mendapatkan direct download link dari URL Mediafire
 * @param {string} url - URL Mediafire yang akan di-scrape
 * @returns {Promise<{status: boolean, message: string, data: object|null, error: string|null}>} 
 */
export const mediafire = async (url) => {
    let browser;
    try {
        // Launch browser dengan mencoba headless terlebih dahulu
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });

        let page = await browser.newPage();
        
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        await page.setViewport({ width: 1920, height: 1080 });

        // Coba dengan headless true terlebih dahulu
        try {
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await page.waitForSelector('#downloadButton', {
                timeout: 10000
            });
        } catch (headlessError) {
            // Jika gagal dengan headless true, coba dengan headless false
            await browser.close();
            
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-size=1920x1080'
                ]
            });

            page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await page.waitForSelector('#downloadButton', {
                timeout: 15000
            });
        }

        // Dapatkan informasi file
        const result = await page.evaluate(() => {
            const filename = document.querySelector('.dl-btn-label')?.textContent?.trim() || '';
            const filesize = document.querySelector('.details li:first-child span')?.textContent?.trim() || '';
            const downloadUrl = document.querySelector('.download_link .input')?.getAttribute('href') || '';

            return {
                filename,
                filesize,
                downloadUrl
            };
        });

        if (!result.downloadUrl) {
            return {
                status: false,
                message: "Download link not found for the given Mediafire URL",
                data: null,
                error: "Download link not found"
            };
        }

        return {
            status: true,
            message: "Success fetching Mediafire download information",
            data: {
                filename: result.filename || "Unknown File",
                filesize: result.filesize || "Unknown Size",
                downloadUrl: result.downloadUrl
            },
            error: null
        };

    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch Mediafire download information",
            data: null,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

// (async () => {
//   const result = await mediafire('https://www.mediafire.com/file/scdzsdv6sm14o1t/startback_aio_1.0.120.1.zip/file');
//   console.log(result);
// })();
