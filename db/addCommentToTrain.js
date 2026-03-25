import { getDB } from "../db/mongoClient.js";
import { getActualEVU } from "../shared/evuMap.js";
import { replaceProfanities } from "no-profanity";
import logger from "../utils/logger.js";

export async function addCommentToTrain(train, operationDate, comment) {
  comment = replaceProfanities(`${comment}`);

  const db = getDB();
  const collection = db.collection("formations");

  const match = train.match(/^([\p{L}]+)\s#(\d{1,6})$/u);

  if (!match) {
    logger.error(`Invalid string: ${train}`);
    return false;
  }

  const rawEVU = match[1];
  const trainNumber = parseInt(match[2]);
  const evu = getActualEVU(rawEVU);

  if (
    !operationDate.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
  ) {
    logger.error(`Invalid date: ${operationDate}`);
    return false;
  }

  logger.info(
    `evu: ${evu}, operationDate: ${operationDate}, number: ${trainNumber}`,
  );

  const query = { evu, operationDate, trainNumber };
  const search = await collection.findOne(query);

  if (
    search.response.primaryVehicles.join("+") ===
    comment.trim().replace(/\s+/g, "")
  ) {
    await collection.updateOne(query, {
      $unset: { "response.comment": "" },
    });

    return true;
  }

  await collection.updateOne(query, {
    $set: { "response.comment": comment },
  });

  return true;
}
