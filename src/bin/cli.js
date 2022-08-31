#!/usr/bin/env node
import * as fs from "node:fs/promises";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import axios from "axios";
import GetURlsDownloads from "../index.js";
import yargs from "./yargs.cjs";

const getBuffer = (url) => axios.get(url, {responseEncoding: "arraybuffer", responseType: "arraybuffer"}).then(({data}) => Buffer.from(data));
const Args = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth()).option("id", {
  alias: "i",
  description: "Folder ID or mediafire url",
  demandOption: true
}).option("output", {
  description: "Folder or File path to save files",
  default: path.join(process.cwd(), "Mediafire_Download_URls"+((process.argv.some(arg => /-((d|-download))/.test(arg)))?"":".json")),
  alias: "o",
}).option("download", {
  description: "Download files and save on output",
  alias: "d",
  type: "boolean",
  default: false
}).parse();

// Run
const MediafireID = (Args.i || Args.id);
GetURlsDownloads(MediafireID).then(async function (Data) {
  let Output = (Args.o || Args.output)||(MediafireID.match(/.*\/(.*)$/)||[])[1];
  if (Args.d || Args.download) {
    if (!(existsSync(Output))) mkdirSync(Output);
    return Promise.all(Data.map(async file => {console.log("Downloading %s, url: %s", file.name, file.url); return getBuffer(file.url).then(fileBuff => fs.writeFile(path.join(Output, file.name), fileBuff)).catch(err => err);}));
  }
  writeFileSync(Output, JSON.stringify(Data, null, 2));
  console.log(`File saved to ${Output}`);
});
