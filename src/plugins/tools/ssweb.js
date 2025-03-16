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
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set viewport size
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Capture screenshot
        const screenshotBuffer = await page.screenshot({ fullPage: true });

        // Close browser
        await browser.close();

        // Send screenshot
        await sock.sendMessage(id, { image: screenshotBuffer, caption: `🖼️ Screenshot of: ${url}` });
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ An error occurred while capturing the screenshot:\n\n${error.message}` });
    }
};
