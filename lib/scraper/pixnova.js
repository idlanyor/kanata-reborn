/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pixnova Image to Anime Converter
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const baseurl = 'https://pixnova.ai/photo-to-anime-converter/';

export default class Pixnova {
    constructor(query, image) {
        this.query = query;
        this.image = image;
        this.imagePath = '';
    }

    async convert() {
        try {
            await this.prepareImage();
            const browser = await this.launchBrowser();
            const page = await browser.newPage();
            await this.setupPage(page);
            await this.uploadImage(page);
            const result = await this.getResult(page);
            await browser.close();
            return result;
        } catch (error) {
            return {
                status: false,
                message: "Gagal mengkonversi gambar",
                data: null,
                error: error.message
            };
        }
    }

    async prepareImage() {
        if (this.image.startsWith('http')) {
            const response = await fetch(this.image);
            const buffer = await response.buffer();
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            this.imagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
            fs.writeFileSync(this.imagePath, buffer);
        } else {
            this.imagePath = this.image;
        }
    }

    async launchBrowser() {
        return await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
        });
    }

    async setupPage(page) {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });
        await page.goto(baseurl, {
            waitUntil: 'networkidle0'
        });
    }

    async uploadImage(page) {
        await page.waitForSelector('.yi-upload');
        const inputFile = await page.$('input[type="file"]');
        await inputFile.uploadFile(this.imagePath);
        await page.waitForSelector('.el-textarea__inner', {
            timeout: 30000
        });
        await page.evaluate(() => {
            const textarea = document.querySelector('.el-textarea__inner');
            textarea.value = '';
        });
        await page.type('.el-textarea__inner', this.query);
        await page.click('button.el-button.el-button--primary');
        await page.waitForSelector('.yi-result-container', {
            timeout: 30000
        });
    }

    async getResult(page) {
        const result = await page.evaluate(() => {
            const downloadLink = document.querySelector('.el-image__inner')?.src;
            const thumbnail = document.querySelector('.el-image__inner')?.src;

            return {
                downloadLink,
                thumbnail
            };
        });

        if (this.image.startsWith('http')) {
            fs.unlinkSync(this.imagePath);
        }

        if (!result || !result.downloadLink) {
            return {
                status: false,
                message: "Gagal mendapatkan hasil konversi gambar",
                data: null,
                error: "Hasil tidak ditemukan"
            };
        }

        return {
            status: true,
            message: "Berhasil mengkonversi gambar",
            data: {
                thumbnail: result.thumbnail,
                downloadUrl: result.downloadLink,
            },
            error: null
        };
    }
}

// contoh cara pakenya
// (async () => {
//     try {
//         const imageUrl = 'https://static.promediateknologi.id/crop/0x537:1440x1799/0x0/webp/photo/p2/45/2024/07/26/Ella-JKT48-Instagram-jkt48ellaa-3899199248.jpg';
//         const query = "Convert this image into an anime style resembling Ghibli";
//         const converter = new Pixnova(query, imageUrl);
//         const result = await converter.convert();
//         console.log(result);
//     } catch (error) {
//         console.error(error);
//     }
// })();
