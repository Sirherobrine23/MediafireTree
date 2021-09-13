const chromium = require("chromium");
const puppeteer = require("puppeteer");

// Original author of this file: https://github.com/karelkryda
// Original File url: https://github.com/karelkryda/universal-speedtest/blob/master/src/Utils.ts

async function launchBrowser(executablePath) {
    try {
        //Launches Puppeteer browser for Windows and MacOS
        return await puppeteer.launch({ executablePath: chromium.path, args: ["--no-sandbox"] });
    } catch (error) {
        try {
            //Launches the Puppeteer browser for Linux systems based on ARM processors
            return await puppeteer.launch({ executablePath: "/usr/bin/chromium-browser", args: ["--no-sandbox"] });
        } catch (error) {
            if (executablePath) {
                try {
                    //Launches the Puppeteer browser using a user-specified path
                    return await puppeteer.launch({ executablePath, args: ["--no-sandbox"] });
                } catch (error) {
                    throw new Error("Unable to launch Puppeteer. Create a problem with the log here https://github.com/Sirherobrine23/MediafireFetchTreeFolder/issues");
                }
            } else throw new Error("Unable to launch Puppeteer. Create a problem with the log here https://github.com/Sirherobrine23/MediafireFetchTreeFolder/issues");
        }
    }
}

module.exports = launchBrowser;