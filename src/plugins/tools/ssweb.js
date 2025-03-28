import puppeteer from 'puppeteer';

export const description = "🖼️ *Web Screenshot*";
export const handler = "ssweb";

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "📸 Please provide a URL to capture a screenshot.\n\nExample: *ssweb https://example.com*"
        });
        return;
    }

    const url = psn.trim();

    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        await sock.sendMessage(id, { text: "❌ Invalid URL. Please provide a valid URL." });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '📸 Capturing screenshot, please wait... ⏳' });

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();

        // Set user agent untuk menghindari deteksi bot
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Tambahkan timeout untuk menghindari hanging
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });


        // Capture screenshot dengan opsi yang lebih lengkap
        const screenshotBuffer = await page.screenshot({ 
            fullPage: true,
            type: 'jpeg',
            quality: 80,
            encoding: 'binary'
        });

        // Close browser
        await browser.close();

        // Send screenshot
        await sock.sendMessage(id, { image: screenshotBuffer, caption: `🖼️ Screenshot of: ${url}` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ An error occurred while capturing the screenshot:\n\n${error.message}` });
    }
};
