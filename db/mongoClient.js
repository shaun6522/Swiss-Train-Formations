import logger from "../utils/logger.js";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.DBURI, {
  tlsCertificateKeyFile: process.env.X509_CRED,
  serverApi: ServerApiVersion.v1,
});

let db;

export async function connectToDB() {
  try {
    await client.connect();
    db = client.db();

    await db.command({ ping: 1 });
    logger.info("Connected to database");
  } catch (err) {
    logger.error("Database connection error: ", err);
    throw err;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
}

export async function closeDB() {
  await client.close();
  logger.info("Database connection closed");
}
