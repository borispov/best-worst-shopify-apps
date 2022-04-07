import puppeteer, { Puppeteer } from 'puppeteer';
import categories from '../pages/api/categoriesWithLinks.json'

export type CategoryName = string;
export type SubCategoryName = string;
export type ShopifyAppName = string;

export interface ICategoryRequest {
    name: string;
}

export interface IShopifyApp {
    title: ShopifyAppName;
    link: string,
    posiiton: number,
    category: CategoryName,
    subCategory: SubCategoryName,
    totalReviews: number,
    averageRating: number,
    ratings: string[]
}

const BASEURL = `https://apps.shopify.com/browse/`;

export type CatName = keyof typeof categories;

export const catToUrl = (cat:string, sortBy:string = 'installed') => `${cat}${sortBy?'?sort_by=installed':null}`
export const getCategory = (cat:CatName):Object => {
    return categories[cat];
}



// CONSTANTS
const baseURL = 'https://apps.shopify.com/browse'
const reviewsAnchorSelector = '.ui-review-count-summary a';
const averageReviewSelector = '.ui-star-rating__rating';
const ratingListSelector = '.reviews-summary__rating-breakdown';
const nextPageSelector = '.search-pagination__next-page-text';
const ratingItemSelector = '.reviews-summary__review-count'
const uiAppCardSelector = '.ui-app-card';


const BREAK_TIME_IN_MS = 5000;


interface AppLink {
    href: string,
    title: string,
    position: number
}


export const linksCrawler: (url: string) => Promise<any> = async (url) => {
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        if (await page.$('.ui-app-card') === null) { 
            return undefined // It'll return undefined if we reach shopify's request limit.
        }

        // page.evaluate seems to be more convinient than page.$ for some reason.
        // for instance, everything runs in the browser context before it reaches back NODE environment again
        // e.g no back n forth
        return await page.evaluate(() => {
            const results = document.querySelectorAll('.ui-app-card');
            return [...results].map((el, index) => ({
                href: el.querySelector('a')?.href.split('?')[0],
                title: el.querySelector('h2')?.textContent,
                position: index
            }))
        })
    } catch (error) {
        console.log(`an error occured executing func: linksCrawler.
        error: ${error}`)
        return
    } finally {
        await page.close();
    }
};

export const ratingCrawler: (Record:AppLink, catInfo:object, isBreak?:Boolean) => Promise<any> = async (appData, catInfo, isBreak) => {
    if (!appData?.href) {
        Promise.reject('appData must contain AppLink Record')
    }
    
    const page = await browser.newPage();

    if (isBreak) {
        console.log(`waiting for ${BREAK_TIME_IN_MS}`)
        await page.waitForTimeout(BREAK_TIME_IN_MS)
    }

    try {
        await page.goto(appData.href, { waitUntil: 'networkidle2' });
        await page.waitForSelector(reviewsAnchorSelector);

        // pass selectors hierarchically:
        // reviewsAnchorSelector (review div a) -> avg R -> ratings' ul -> ratings' li items
        const reviewData = await page.evaluate((sel1, sel2, sel3, sel4) => {
            let ratings = [5, 4, 3, 2, 1]; // 1st DOM element inside reviews is 5-STAR. That is why we reverse it.
            const allReviews = document.querySelector(sel1).textContent;
            const averageRating = document.querySelector(sel2).textContent;
            const reviews = [...document.querySelectorAll(sel3)]
                .map((element, i) => ({
                    count: element.querySelector(sel4)?.textContent,
                    rating: ratings[i]
                }))
            return {
                total: allReviews,
                average: averageRating,
                ratings: reviews,
            }

        }, reviewsAnchorSelector, averageReviewSelector, ratingListSelector, ratingItemSelector )

        // console.log({
        //     ...appData,
        //     ...reviewData
        // })
        return {
            ...appData,
            ...reviewData,
            ...catInfo
        }
    } catch (error) {
        console.log(`an error occured executing func: linksCrawler.
        error: ${error}`)
        return
    } finally {
        await page.close();
    }
}