// Temporary script to add primaryVehicles to all database entries

import * as mongoClient from "./db/mongoClient.js";
import { getPrimaryVehicles } from "./shared/getPrimaryVehicles.js";

async function migrate() {
  await mongoClient.connectToDB();

  const db = mongoClient.getDB();
  const collection = db.collection("formations");

  const cursor = collection.find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const primaryVehicles = getPrimaryVehicles(
      doc.response.service.formations[0].formationVehicles,
    );

    console.log(primaryVehicles);

    await collection.updateOne(
      { _id: doc._id },
      { $set: { "response.primaryVehicles": primaryVehicles } },
    );

    console.log(
      `Updated ${doc._id} with ${primaryVehicles.length} primary vehicles`,
    );
  }

  await mongoClient.closeDB();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
