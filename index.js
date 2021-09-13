const { JSDOM } = require("jsdom");
const ChromiumLauch = require("./src/chromium")
if (typeof fetch === "undefined") global.fetch = (...args) => import("node-fetch").then(mod => mod.default(...args));

async function Folder(FolderURL = "") {
    // Link test: const link_reg = new RegExp(/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm)
    // Load chromium
    const browser = (await ChromiumLauch())
    const page = await browser.newPage();
    if (!/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm.test(FolderURL)) FolderURL = `https://www.mediafire.com/folder/${FolderURL}`;
    console.log(FolderURL)
    await page.goto(FolderURL);
    
    // Get Html
    await page.waitForSelector("#main_list > li", {
        // timeout: 0
    });
    const HTML = await page.evaluate(() => document.querySelector("#main_list").outerHTML);
    await browser.close();

    const { document } = (new JSDOM(HTML).window);
    const UrlsAndNames = [];
    for (let li of [...document.querySelectorAll("#main_list > li")]) {
        // document.querySelector("#file-fji1q5wygteschg > a.thumbnailClickArea")
        const link = li.querySelector("a.thumbnailClickArea");
        UrlsAndNames.push(await OneFile(link.href));
    }
    return UrlsAndNames;
}

async function OneFile(url = "") {
    const HtmlBody = await (await fetch(url)).text();
    const { document } = (new JSDOM(HtmlBody).window);
    const Name = document.querySelector("body > div.mf-dlr.page.ads-alternate > div.content > div.center > div > div.dl-info > div.sidebar > div.apps > div > div").innerHTML.replace(/\n/gi, "").trim();
    const Href = document.querySelector("#downloadButton").href;
    return {
        name: Name,
        link: Href,
        url: Href
    }
}

// Export
module.exports = Folder;
module.exports.Folder = Folder;
module.exports.OneFile = OneFile;