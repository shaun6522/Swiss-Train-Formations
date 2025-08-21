import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import path from "path";

import bodyParser from "body-parser";
import cron from "node-cron";
import express from "express";
import favicon from "serve-favicon";
import helmet from "helmet";
import logger from "./utils/logger.js";
import * as mongoClient from "./db/mongoClient.js";
import { rateLimit } from "express-rate-limit";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

const limiter = rateLimit({
  windowsMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(helmet());

app.use(limiter);

if (process.env.PROXY_COUNT) {
  app.set("trust proxy", parseInt(process.env.PROXY_COUNT));
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/shared", express.static(path.join(__dirname, "shared")));

app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  res.locals.styleNonce = crypto.randomBytes(16).toString("base64");
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.styleNonce}'`],
      fontSrc: ["'self'", "https:", "data:"],
    },
  }),
);



// Cron job scheduling

// Check the server status every 10 minutes
//cron.schedule("*/10 * * * *", () => {
//  checkServerStatus();
//});

// At 02:00 each day, run through the services.txt and get formation of all
//cron.schedule("0 2 * * *", () => {
//  getServicesFromTxt();  
//});



// Server start

try {
  await mongoClient.connectToDB();
  app.use("/", routes);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.stack}`);
    res.status(500).render("500", {
      errorMessage: "Internal Server Error",
    });
  });

  const server = app.listen(port, () => {
    logger.info(
      `Server listening on port ${port} in ${process.env.NODE_ENV} mode`,
    );
  });

  process.on("SIGINT", async () => {
    logger.info("Shutting down server..");
    await mongoClient.closeDB();
    server.close(() => {
      process.exit(0);
    });
  });
} catch (err) {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
}
