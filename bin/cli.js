#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const Args = require("minimist")(process.argv.slice(2));
const GetURlsDownloads = require("../src/index");
const axios = require("axios").default;
const help = [
  "Usage:",
  "  get_mediafire_urls [options]",
  "",
  "Options:",
  "  -h, --help",
  "  -i, --id <url>(Required)",
  "  -o, --output <output>",
  "  -d, --download",
  "  -v, --version",
  "",
  "Examples:",
  "  get_mediafire_urls -i 4lljccm6brv48/Documents",
]

// Help
if (Args.h || Args.help) {
  console.log(help.join("\n"));
  process.exit(0);
}

const getBuffer = (url) => axios.get(url, {
  responseEncoding: "arraybuffer",
  responseType: "arraybuffer"
  }).then(({data}) => Buffer.from(data));

// Run
const MediafireID = (Args.i || Args.id);
if (!(MediafireID)) {
  console.log(help.join("\n"));
  process.exit(1);
}
GetURlsDownloads(MediafireID).then(async function (Data) {
  if (Args.d || Args.download) {
    const Output = (Args.o || Args.output)||(MediafireID.match(/.*\/(.*)$/)||[])[1];
    if (!(fs.existsSync(Output))) fs.mkdirSync(Output);
    for (let file of Data) {
      console.log(`Downloading ${file.name}`);
      try {
        const FileOut = path.join(Output, file.name);
        const DataBuffer = await getBuffer(file.url);
        fs.writeFileSync(FileOut, DataBuffer);
        console.log(`Downloaded ${file.name}`);
      } catch (err) {
        console.log(`Error downloading ${file.name}, url: ${file.url}`);
        console.log(err);
      }
    }
  } else {
    const Output = (Args.o || Args.output) || path.resolve(process.cwd(), "Mediafire_Download_URls.json");
    fs.writeFileSync(Output, JSON.stringify(Data, null, 2));
    console.log(`File saved to ${Output}`);
  }
}).catch(err => {
  console.log("Error");
  console.log(err);
});
