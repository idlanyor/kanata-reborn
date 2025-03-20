import puppeteer from "puppeteer";
import randomUseragent from "random-useragent";
import chalk from "chalk";
import boxen from "boxen";

const REPO_URL = "https://github.com/idlanyor/kanata-reborn";
const VISIT_COUNT = 100; // Jumlah visitor palsu

const displayUI = (message, type = "info") => {
    const colors = { info: "blue", success: "green", warning: "yellow", error: "red" };
    console.log(boxen(chalk[colors[type]](message), { padding: 1, margin: 1, borderStyle: "round" }));
};

const fakeVisitor = async () => {
    displayUI(`🚀 Generating ${VISIT_COUNT} fake visitors for ${REPO_URL}...`, "info");

    for (let i = 1; i <= VISIT_COUNT; i++) {
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

        // Set User-Agent random
        await page.setUserAgent(randomUseragent.getRandom());

        // Kunjungi halaman repo
        await page.goto(REPO_URL, { waitUntil: "networkidle2" });

        displayUI(`👀 Fake visitor #${i} sent!`, "success");
        await browser.close();
    }

    displayUI("🎉 All fake visitors generated!", "success");
};

fakeVisitor();
