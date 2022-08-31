import { JSDOM } from "jsdom";
import axios from "axios";
import chromium from "chromium";
import { launch } from "puppeteer";
const getBuffer = (url) => axios.get(url, {responseEncoding: "arraybuffer", responseType: "arraybuffer"}).then(({data}) => Buffer.from(data));

// Original author of this file: https://github.com/karelkryda
// Original File url: https://github.com/karelkryda/universal-speedtest/blob/master/src/Utils.ts
async function ChromiumLauch(executablePath) {
  //Launches Puppeteer browser for Windows and MacOS
  return launch({ executablePath: chromium.path, args: ["--no-sandbox"] })
  //Launches the Puppeteer browser for Linux systems based on ARM processors
  .catch(() => launch({ executablePath: "/usr/bin/chromium-browser", args: ["--no-sandbox"] }))
  //Launches the Puppeteer browser using a user-specified path
  .catch(() =>launch({ executablePath, args: ["--no-sandbox"]}))
  .catch(() => Promise.reject<Error>(new Error("Unable to launch Puppeteer. Create a problem with the log here https://github.com/Sirherobrine23/MediafireFetchTreeFolder/issues")));
}
/**
 *
 * @param {string} url
 * @returns {Promise<{name: string, url: string}>}
 */
async function OneFile(url) {
  const { document } = (new JSDOM((await getBuffer(url)).toString("utf8")).window);
  const Href = document.querySelector("#downloadButton").href;
  let Name = document.querySelector("body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div")?.title?.trim();
  if (!Name) Name = (url.match(/file\/.*\/(.*)\/file/)||[])[1];
  if (!Name) throw new Error("Cannot get file name");
  return {name: Name, url: Href}
}

async function Folder(FolderURL) {
  // Link test: const link_reg = new RegExp(/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm)
  // Load chromium
  const browser = (await ChromiumLauch())
  const page = await browser.newPage();
  if (!/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm.test(FolderURL)) FolderURL = `https://www.mediafire.com/folder/${FolderURL}`;
  await page.goto(FolderURL);

  // Get Html
  await page.waitForSelector("#main_list > li", {/*timeout: 0*/});
  /** @type {string|undefined} */
  const HTML = await page.evaluate(() => document.querySelector("#main_list").outerHTML);
  await browser.close();

  const { document } = (new JSDOM(HTML).window);
  return Promise.all(([...document.querySelectorAll("#main_list > li")]).map(li => OneFile((li.querySelector("a.thumbnailClickArea"))?.href).catch(err => ({Error: String(err).replace("Error: ", "")}))));
}

// Export
export default Folder;
const _Folder = Folder;
export { _Folder as Folder };
const _OneFile = OneFile;
export { _OneFile as OneFile };
