/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pddikti Scraper
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */
import puppeteer from 'puppeteer';

export const pddiktiSearch = async (q) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`https://pddikti.kemdiktisaintek.go.id/search/${q}`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('table.w-full');

        const data = await page.$$eval('table.w-full tbody tr', rows => {
            return rows.map(row => {
                const columns = row.querySelectorAll('td');
                return {
                    nama: columns[0]?.innerText.trim() || '',
                    nim: columns[1]?.innerText.trim() || '',
                    perguruanTinggi: columns[2]?.innerText.trim() || '',
                    programStudi: columns[3]?.innerText.trim() || '',
                    link: columns[4]?.querySelector('a')?.href || ''
                };
            });
        });
        await browser.close();

        if (!data || data.length === 0) {
            return {
                status: false,
                message: "No results found for the given query",
                data: null,
                error: "Data not found"
            };
        }

        return {
            status: true,
            message: "Success searching PDDIKTI data",
            data: data,
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to search PDDIKTI data",
            data: null,
            error: error.message
        };
    }
}

export const mahasiswaDetail = async (link) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle0' });
        await page.waitForSelector('div.w-full.bg-white.rounded-lg.p-5');

        const data = await page.$$eval('div.w-full.bg-white.rounded-lg.p-5 > div.mb-4', elements => {
            const result = {};
            elements.forEach(element => {
                const key = element.querySelector('p.text-s.font-normal')?.innerText.trim();
                const value = element.querySelector('p.text-lg.font-semibold')?.innerText.trim();
                if (key && value) {
                    result[key] = value;
                }
            });
            return result;
        });
        await browser.close();

        if (!data || Object.keys(data).length === 0) {
            return {
                status: false,
                message: "No student details found for the given link",
                data: null,
                error: "Data not found"
            };
        }

        return {
            status: true,
            message: "Success fetching student details",
            data: data,
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch student details",
            data: null,
            error: error.message
        };
    }
};

// (async () => {
//     // console.log(await pddiktiSearch('STMIK Widya Utama'))
//     // console.log(await pddiktiSearch('SSI202203088').then(async (res) => { return await mahasiswaDetail(res[0].link) }))
// })()
