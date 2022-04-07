import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer';
import CategoryService from '../../../../libs/CategoryService';


const getCategoryHandler: (
    req: NextApiRequest, 
    res:NextApiResponse
) => any = async(req, res) => {
    const { cat, subcat } = req.body; 

    try {
        console.log(`Accessing subcat endpoint`)
        const browser = await puppeteer.launch();
        const categoryService = new CategoryService(browser, cat, subcat);
        const apps = await categoryService.crawlSubCategory();
        console.log(apps)
        return apps
    } catch (error) {
        console.log(`Could Not crawlSubCategory: ${error}`)
    }

}


export default getCategoryHandler;