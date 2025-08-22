import fs from "fs/promises";
import path from "path";

import { getCachedOrFreshFormation } from "../db/getCachedOrFreshFormation.js";
import logger from "../utils/logger.js";

export default async function runMaintenanceTasks() {
  try {
    const BATCH_SIZE = 5;
    const WAIT_TIME_MS = 60_100; // 1 minute + small delay

    // Before we start calling the API, wait for the potential timeout to pass
    await sleep(WAIT_TIME_MS);

    const now = new Date();
    const day = now.getDay();
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Europe/Zurich",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    const operationDate = formatter.format(now);

    let fileName;

    if (day === 0) {
      fileName = "services_weekday.txt";
    } else if (day === 6) {
      fileName = "services_saturday.txt";
    } else {
      fileName = "services_weekday.txt";
    }

    const filePath = path.join(process.cwd(), fileName);
    const fileContents = await fs.readFile(filePath, "utf-8");

    const services = fileContents
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [evu, trainNumber] = line.split(" ");
        return { evu, trainNumber };
      });

    for (let i = 0; i < services.length; i += BATCH_SIZE) {
      const batch = services.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (service) => {
          await getCachedOrFreshFormation(
            service.evu,
            operationDate,
            service.trainNumber,
          );
        }),
      );

      logger.info(`Batch ${i / BATCH_SIZE + 1} complete`);

      if (i + BATCH_SIZE < services.length) {
        await sleep(WAIT_TIME_MS);
      }
    }
  } catch (err) {
    return err;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
