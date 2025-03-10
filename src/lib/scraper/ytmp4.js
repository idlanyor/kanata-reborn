/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Youtube Video Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

// Fungsi untuk mendeteksi kualitas video dari URL
function getVideoQuality(url) {
    const itag = url.match(/[&?]itag=(\d+)/)?.[1];
    if (!itag) return 'Unknown';

    const qualities = {
        '18': '360p MP4',
        '22': '720p MP4',
        '137': '1080p MP4',
        '136': '720p MP4',
        '135': '480p MP4',
        '134': '360p MP4',
        '133': '240p MP4',
        '140': 'Audio MP4',
    };

    return qualities[itag] || 'Unknown';
}

// Fungsi untuk mengekstrak judul dari URL video
function extractTitleFromUrl(url) {
    const titleMatch = url.match(/[&?]title=([^&]+)/);
    if (titleMatch && titleMatch[1]) {
        // Decode URI component dan ganti + dengan spasi
        return decodeURIComponent(titleMatch[1].replace(/\+/g, ' '));
    }
    return "Untitled Video";
}

export const ytVideo = async (url) => {
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

        // Pertama kita coba ambil judul dari YouTube
        let videoTitle = "Untitled Video";
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
            videoTitle = await page.evaluate(() => {
                const titleElement = document.querySelector('title');
                if (titleElement) {
                    let title = titleElement.textContent;
                    // Hapus " - YouTube" dari judul jika ada
                    title = title.replace(/ - YouTube$/, '');
                    return title;
                }
                return "Untitled Video";
            });
        } catch (error) {
            console.log("Gagal mengambil judul dari YouTube:", error);
        }

        await page.goto('https://shortsnoob.com/en1', { waitUntil: 'networkidle2' });

        const inputSelector = '#url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#start';
        await page.click(submitButtonSelector);

        const resultSelector = '#result';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(async () => {
            const videoSrc = document.querySelector('video source')?.getAttribute('src');
            const downloadLinks = Array.from(
                document.querySelectorAll('.download-table a')
            ).map((a) => a.href);

            return { videoSrc, downloadLinks };
        });

        await browser.close();

        if (!result.videoSrc || !result.downloadLinks || result.downloadLinks.length === 0) {
            return {
                status: false,
                message: "No download links found for the given YouTube Shorts URL",
                data: null,
                error: "Content not found"
            };
        }

        // Membuat array downloads dengan informasi kualitas
        const downloads = result.downloadLinks.map(url => ({
            url: url,
            quality: getVideoQuality(url)
        }));

        return {
            status: true,
            message: "Success scraping YouTube Shorts video",
            data: {
                title: videoTitle,
                videoUrl: result.videoSrc,
                downloads: downloads,
                qualities: downloads.map(d => d.quality)
            },
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to scrape YouTube Shorts video",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     console.log((await ytVideo('https://www.youtube.com/shorts/CCmY6cvTBG4')).data.downloads)
// })()

