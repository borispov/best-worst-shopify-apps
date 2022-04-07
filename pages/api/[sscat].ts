import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer';
import { catToUrl, getCategory, CatName, linksCrawler, ratingCrawler } from '../../libs/scraper-utils';


type CategoryName = string;
type SubCategoryName = string;
type ShopifyAppName = string;

interface ICategoryRequest {
    name: string;
}

interface IShopifyApp {
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


const getCategoryHandler: (req: NextApiRequest, res:NextApiResponse) => any = (req, res) => {
    const categoryName = req.body as CategoryName;
    // get all apps from within this category. maybe it's better to get by SUB-category?
}


// MUST call CategoryService.closeBrowser() --> after finish work
export default class CategoryService {

    categoryName: CategoryName;
    browser: puppeteer.Browser;
    
    constructor(categoryName: CategoryName, browser: puppeteer.Browser) {
            this.categoryName = categoryName;
            this.browser = browser;
    }


    async crawlSubCategory(subCat: SubCategoryName, cat: CategoryName):Promise<IShopifyApp[]> {
        const page = await this.browser.newPage();
        const apps:any = [];
        try {
            const url = this.getUrl(cat, false);
            const appLinks = await linksCrawler(url)
            for await (const [i, app] of appLinks.entries()) {
                const crawledApp = await ratingCrawler(app, {subCat, cat});
                apps.push(crawledApp);
            }
            return apps;
        } catch (error) {
            console.log(`An Error Occured: ${error}`)
            return apps;
        } finally {
            await page.close();
        }
    }

    getUrl(cat: CategoryName, withBaseUrl:boolean = true):string {
        if (!withBaseUrl) { return catToUrl(BASEURL + cat)}
        return catToUrl(cat);
    }

    getUrls(cat: CatName):string[] {
        let categories = getCategory(cat);
        return Object.values(categories).map(value => this.getUrl(value));
    }

    async closeBrowser() {
        await this.browser.close(); 
    }

}