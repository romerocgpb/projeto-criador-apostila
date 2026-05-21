const puppeteer = require('puppeteer-core');

async function conn() {
    const browser = await puppeteer.connect({browserWSEndpoint: 'ws://127.0.0.1:5525/devtools/browser/dccb5424-9052-4930-8f49-56a6b7858d5a'})

    let zai_page = await browser.newPage();

    // await browser.disconnect()
    
}

conn()