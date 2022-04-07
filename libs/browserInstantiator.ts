import puppeteer, { Puppeteer } from "puppeteer"
export default async function() {
    try {
        const browser = await puppeteer.launch();
        return browser
    } catch(error) {
        throw new Error(`BROWSER UNAVAILABLE: ${error}`)
    } 
}