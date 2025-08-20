import { getDB } from "../db/mongoClient.js";
import { getPrimaryVehicles } from "../shared/getPrimaryVehicles.js";
import { getServiceDetails } from "../utils/getServiceDetails.js";
import logger from "../utils/logger.js";

const MAX_CACHE_AGE_HOURS = 12;

// Development
const logResponse = false;

export async function getCachedOrFreshFormation(evu, date, trainNumber) {
  const db = getDB();
  const collection = db.collection("formations");

  const query = { evu, operationDate: date, trainNumber };
  const cached = await collection.findOne(query);

  const now = new Date();
  const isFresh =
    cached &&
    (now - new Date(cached.cachedAt)) / 1000 / 60 / 60 < MAX_CACHE_AGE_HOURS;

  if (isFresh) {
    logger.info(
      `Using cached response: /?evu=${query.evu}&operationDate=${query.operationDate}&trainNumber=${query.trainNumber}`,
    );

    if (process.env.NODE_ENV == "development" && logResponse == true) {
      logger.info(JSON.stringify(cached.response));
    }

    return cached.response;
  }

  const freshData = await getServiceDetails(evu, date, trainNumber);

  if (freshData.status == 200) {
    logger.info(
      `Fetching from API: /?evu=${query.evu}&operationDate=${query.operationDate}&trainNumber=${query.trainNumber}`,
    );

    const primaryVehicles = getPrimaryVehicles(
      freshData.service.formations[0].formationVehicles,
    );

    await collection.updateOne(
      query,
      {
        $set: {
          response: { ...freshData, primaryVehicles },
          cachedAt: now,
        },
      },
      { upsert: true },
    );
  }

  if (process.env.NODE_ENV == "development" && logResponse == true) {
    logger.info(JSON.stringify(freshData));
  }

  return freshData;
}
