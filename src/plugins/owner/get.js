import puppeteer from 'puppeteer';
// import { checkOwner } from '../../helper/permission.js';

export default async ({ sock, m, id, noTel, psn }) => {
    if (!psn) {
        await sock.sendMessage(id, { text: '❌ Masukkan URL yang akan di-GET!\n*Contoh:* !get https://example.com' });
        return;
    }

    let url = psn.split('\n')[0];
    
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const contentType = await page.evaluate(() => document.contentType);
        
        if (contentType.includes('application/json')) {
            const json = await page.evaluate(() => document.body.innerText);
            await sock.sendMessage(id, { text: `🛜 *GET Request*\n\n📃 *Response:*\n${json}` });
        } else if (contentType.includes('image')) {
            await sock.sendMessage(id, { image: { url }, caption: '☑️ Response 200 OK ☑️' });
        } else if (contentType.includes('video')) {
            await sock.sendMessage(id, { video: { url }, caption: '☑️ Response 200 OK ☑️' });
        } else if (contentType.includes('audio')) {
            await sock.sendMessage(id, { audio: { url }, mimetype: 'audio/mpeg' });
        } else if (contentType.includes('application') || contentType.includes('text/csv')) {
            await sock.sendMessage(id, { document: { url }, mimetype: contentType, fileName: 'document' });
        } else {
            const text = await page.evaluate(() => document.body.innerText);
            await sock.sendMessage(id, { text: `🛜 *GET Request*\n\n📃 *Response:*\n${text.substring(0, 4000)}` });
        }
        
        await browser.close();
        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ *ERROR*\n\n${error.message}` });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
};

export const handler = 'get';
export const description = 'Melakukan HTTP GET request dengan Puppeteer';
