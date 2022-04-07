import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { createSecureContext } from 'tls';


// UTILS 
const log = console.log;
const randomIntInterval = (min: number, max: number):number => {
    return Math.floor(Math.random() * (max-min) + min);
};
const sleepUntil = async (page: puppeteer.Page, max: number, min: number, action: string) => {
    const sleepDuration = randomIntInterval(min, max);
    console.log(`waiting for ${sleepDuration} seconds BEFORE : ${action}`);
    await page.waitForTimeout(sleepDuration);
};

const URL = "https://apps.shopify.com/browse/";
const mm = 'https://apps.shopify.com/browse/marketing-marketing-and-conversion-analytics'

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


 
let main = async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        // await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1});

        await crawlAppLinks(mm, page);

        // await page.goto(URL, { waitUntil: 'networkidle2'});
    } catch (e) {
        console.log('error occured : \n' + e);
    }
}

// scrapeCat
let scrapeCategory = async (page: puppeteer.Page, category: string) => {
    await page.goto(URL, { waitUntil: 'networkidle2'});
}

let crawlAppLinks = async (
    url: string,
    page: puppeteer.Page,
    cards:Array<{}> = []
):Promise<any> => {

    await page.goto(url, { waitUntil: 'networkidle2'});
    await sleepUntil(page, 600, 40, 'RETRIEVING APP LINKS');
    if (await page.$('.ui-app-card') === null) { return cards }
    
    const domContent = await page.content();
    const $ = cheerio.load(domContent);

    const currentPageCards = $('.ui-app-card')
        .toArray()
        .map(element => ({
                href: $(element + 'a').attr('href'),
                title: $(element + 'a').find('h2').text()
            })
        )

    log(`received those links: ${currentPageCards}`);
    
}

main();