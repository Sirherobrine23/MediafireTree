const { JSDOM } = require("jsdom");
const ChromiumLauch = require("./chromium");
const axios = require("axios").default;
const getBuffer = (url) => axios.get(url, {
  responseEncoding: "arraybuffer",
  responseType: "arraybuffer"
  }).then(({data}) => Buffer.from(data));

/**
 *
 * @param {string} FolderURL
 * @returns {{name: string, link: string, url: string}[]}
 */
async function Folder(FolderURL = "") {
  // Link test: const link_reg = new RegExp(/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm)
  // Load chromium
  const browser = (await ChromiumLauch())
  const page = await browser.newPage();
  if (!/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm.test(FolderURL)) FolderURL = `https://www.mediafire.com/folder/${FolderURL}`;
  console.log(FolderURL)
  await page.goto(FolderURL);

  // Get Html
  await page.waitForSelector("#main_list > li", {/*timeout: 0*/});
  /** @type {string|undefined} */
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
  console.log(url);
  const HtmlBody = (await getBuffer(url)).toString("utf8");
  const { document } = (new JSDOM(HtmlBody).window);
  const Href = document.querySelector("#downloadButton").href;
  let Name = document.querySelector("body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div")?.title?.trim();
  if (!Name) Name = (url.match(/file\/.*\/(.*)\/file/)||[])[1];
  if (!Name) throw new Error("Cannot get file name");
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
