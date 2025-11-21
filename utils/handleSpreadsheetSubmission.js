import fs from "fs/promises";
import path from "path";

import { getCachedOrFreshFormation } from "../db/getCachedOrFreshFormation.js";
import logger from "../utils/logger.js";

import * as https from "https";

export default async function handleSpreadsheetSubmission() {
  // At the moment this is set up to work specifically for BLS 465s. There might be differences when it comes to other sheets which I haven't worked out yet

  try {
    const today = new Date();

    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();

    const datum = `${month}.${day}.${year}`;
    const vlak = '4065_1';
    const vlakova = '465008';

    const postData = `datum=${date}&vlak=${vlak}&vlakova=${vlakova}&vlakovaZeme=ch&postrk=&postrkZeme=ch&priprez=&priprezZeme=ch&poznamka=&nick=SwissTF&from=`;

    const options = {
      hostname: "www.55p.cz",
      port: 443,
      path: "/goldenpass_2025/?odeslat=true",
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
        Origin: "https://www.55p.cz",
        "Alt-Used": "www.55p.cz",
        Connection: "keep-alive",
        Referer:
          "https://www.55p.cz/goldenpass_2025/?vlozit=true&denObehu=Zweisimmen-Interlaken%20Ost*n%20Plan%20A-1&datum=9.11.2025",
        Cookie:
          "lang=en; device_id=66718d984ba8c; nick=SwissTF; sledovaniVozidel=ba63fc917412587e211bd8105d90fd7a",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        Priority: "u=0, i",
        TE: "trailers",
      },
    };

    var req = https.request(options, (res) => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);
      console.log("length:", postData.length);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    req.on("error", (e) => {
      console.error(e);
    });

    req.write(postData);
    req.end();
  } catch (err) {
    return err;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
