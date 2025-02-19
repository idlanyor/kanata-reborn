/**
 * @author : Roy~VC~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Spotify Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const spotifyDownload = async (url) => {
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
    await page.goto('https://spotidown.app/', { waitUntil: 'networkidle2' });

    const inputSelector = '#url';
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, url);

    const submitButtonSelector = '#send';
    await page.click(submitButtonSelector);

    const resultSelector = '#download-section';
    await page.waitForSelector(resultSelector, { visible: true });

    const data = await page.evaluate(() => {
      const title = document.querySelector(".spotidown-downloader-middle h3 div")?.innerText.trim() || "Tidak ditemukan";
      const artist = document.querySelector(".spotidown-downloader-middle p span")?.innerText.trim() || "Tidak ditemukan";
      const coverImage = document.querySelector(".spotidown-downloader-left img")?.src || "Tidak ditemukan";
      const downloadMp3 = document.querySelector(".spotidown-downloader-right a[href*='dl?token']:nth-of-type(1)")?.href || "Tidak ditemukan";

      return { title, artist, coverImage, downloadMp3 };
    });


    await browser.close();
    return data;
  } catch (e) {
    throw new Error('Gagal Cik, ', e.message)
  }
};

// (async () => {
//   console.log(await spotifyDownload('https://open.spotify.com/track/7zOVh5fGpEwSbZd0g9z80B?si=90e87ac6019a48a7'))
// })()

