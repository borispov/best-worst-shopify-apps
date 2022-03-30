import puppeteer from 'puppeteer';

const URL = "https://apps.shopify.com/browse";

const categories: Object = {
    marketing: {
        marketingAnalytics: 'marketing-marketing-and-conversion-analytics',
        advertising:        'marketing-advertising',
        emailMarketing:     'marketing-email-marketing',
        seo:                'marketing-seo',
        directMarketing:    'marketing-direct-marketing',
        contentMarketing:   'marketing-content-marketing',
    }
}

// make it some the time intervals flactuate and does not remain THE SAME.
const randomIntInterval = (min: number, max: number) => {
    return Math.floor(Math.random() * (max-min) + min);
};


const sleepUntil = async (page: puppeteer.Page, max: number, min: number, action: string) => {
    const sleepDuration = randomIntInterval(min, max);
    console.log(`waiting for ${sleepDuration} seconds BEFORE : ${action}`);
    await page.waitForTimeout(sleepDuration);
};


let main = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1});

        await page.goto(URL, { waitUntil: 'networkidle2'});
    } catch (e) {
        console.log('error occured : \n' + e);
    }
}

// scrapeCat
let scrapeCategory = async (page: puppeteer.Page, category: string) => {
    await page.goto(URL, { waitUntil: 'networkidle2'});
}