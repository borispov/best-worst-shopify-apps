import puppeteer, { Puppeteer } from 'puppeteer';
import { catToUrl, getCategory, linksCrawler, ratingCrawler } from './scraper-utils';
import type {CategoryName, SubCategoryName, IShopifyApp, CatName } from './scraper-utils';

const BASEURL = `https://apps.shopify.com/browse/`;


export default class CategoryService {

    categoryName: CategoryName;
    subCategoryName?: SubCategoryName;
    browser: puppeteer.Browser;
    
    constructor(browser: puppeteer.Browser, categoryName: CategoryName, subCategoryName?: SubCategoryName) {
            this.categoryName = categoryName;
            this.browser = browser;
            if (subCategoryName){
                this.subCategoryName = subCategoryName;
            }
    }


    async crawlSubCategory():Promise<IShopifyApp[]> {
        const page = await this.browser.newPage();
        const apps:any = [];
        const cat = this.categoryName as CategoryName;
        const subcat = this.subCategoryName as SubCategoryName;
        try {
            const url = this.getUrl(this.categoryName, false);
            const appLinks = await linksCrawler(url)
            for await (const [i, app] of appLinks.entries()) {
                const crawledApp = await ratingCrawler(app, {cat, subcat});
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

    private getUrl(cat: CategoryName, withBaseUrl:boolean = true):string {
        if (!withBaseUrl) { return catToUrl(BASEURL + cat)}
        return catToUrl(cat);
    }

    private getUrls(cat: CatName):string[] {
        let categories = getCategory(cat);
        return Object.values(categories).map(value => this.getUrl(value));
    }

    public async closeBrowser() {
        await this.browser.close(); 
    }

}