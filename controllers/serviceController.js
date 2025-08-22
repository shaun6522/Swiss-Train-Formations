import { formatEVN } from "../shared/formatEVN.js";
import { getCachedOrFreshFormation } from "../db/getCachedOrFreshFormation.js";
import { getDB } from "../db/mongoClient.js";
import { getTrainJourney } from "../utils/getTrainJourney.js";
import logger from "../utils/logger.js";
import { validateInputs } from "../utils/validateInputs.js";

export async function handleSubmit(req, res) {
  const { evu, operationDate, trainNumber } = req.body;
  const validation = validateInputs({ evu, operationDate, trainNumber });

  if (!validation.isValid) {
    logger.warn(`Validation errors: ${validation.errors}`);
    return res.render("index", {
      errorMessage: validation.errors.join(" "),
      selectedEVU: "SBBP",
      selectedDate: "",
    });
  }

  const { sanitized } = validation;

  const serviceRequest = await getCachedOrFreshFormation(
    sanitized.evu,
    sanitized.operationDate,
    sanitized.trainNumber,
  );
  let errorMessage = "";

  const previousSearchValues = {
    selectedEVU: sanitized.evu || "SBBP",
    selectedDate: sanitized.operationDate,
  };

  // Still not entirely sure how the API chooses which error to return, but this just displays whichever
  switch (serviceRequest.status) {
    case 200:
      break;
    case 400:
      errorMessage = "Train formation unavailable (Error 400: Bad request)";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
    case 403:
      errorMessage = "Train formation unavailable (Error 403: Forbidden)";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
    case 404:
      errorMessage = "Error 404: Not Found";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
    case 429:
      errorMessage = "Rate limit exceeded (Error 429: Too many requests)";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
    case 504:
      errorMessage = "The server timed out (Error 504: Gateway Timeout)";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
    default:
      errorMessage = "Unknown Error";
      logger.error(errorMessage);
      return res.render("index", {
        errorMessage,
        ...previousSearchValues,
      });
  }

  try {
    const { trainMetaInformation, formations } = serviceRequest.service;

    // Sometimes neither the 'evn' or 'parentEvn' fields are filled, but the separate fields are..
    const rawVehicles = formations[0].formationVehicles.map((v) => {
      const {
        typeCodeName,
        buildTypeCode,
        countryCode,
        vehicleNumber,
        checkNumber,
        evn,
        parentEvn,
      } = v?.vehicleIdentifier || {};

      /* The UVx gets appended to the start of unknown vehicles to give them a unique ID
         This is necessary because when we remove the duplicates in the next step, we want to skip the unknown vehicles */
      const backupEvn =
        buildTypeCode && countryCode && vehicleNumber && checkNumber
          ? formatEVN(buildTypeCode + countryCode + vehicleNumber + checkNumber)
          : `UV${v?.position}Unknown vehicle (type ${typeCodeName})`;

      const raw = evn ?? parentEvn;
      return raw ? formatEVN(raw) : backupEvn;
    });

    // Remove duplicates, then strip the unique IDs from the unknown vehicles
    const vehicles = [...new Set(rawVehicles)].map((v) =>
      v.replace(/^UV\d+/, ""),
    );

    const serviceData = {
      trainNumber: trainMetaInformation.trainNumber,
      vehicles,
      trainJourney: getTrainJourney(formations),
    };

    res.render("index", {
      serviceData,
      selectedEVU: sanitized.evu || "SBBP",
      selectedDate: sanitized.operationDate,
    });
  } catch (error) {
    logger.error(error);
    res.render("index", {
      errorMessage: `${error}`,
      ...previousSearchValues,
    });
  }
}

export async function handleVehicleSearch(req, res) {
  try {
    const { vehicleSearchNumber } = req.body;

    if (!vehicleSearchNumber) {
      return res.redirect("/recent");
    }

    // Check the vehicle number contains only digits
    const vehicleNumSanitized = vehicleSearchNumber.trim();
    if (
      !/^\d{1,6}$/.test(vehicleNumSanitized) ||
      vehicleNumSanitized.startsWith("0")
    ) {
      logger.warn("Validation error: invalid vehicle number");
      return res.redirect("/recent");
    }

    const db = getDB();
    const collection = db.collection("formations");

    const matches = await collection
      .find({ "response.primaryVehicles": vehicleNumSanitized })
      .toArray();

    const serviceMatches = matches.map((m) => ({
      evu: m.evu,
      trainNumber: m.trainNumber,
      operationDate: m.operationDate,
    }));

    return res.json({ matches: serviceMatches });
  } catch (err) {
    logger.error(`Error searching vehicle: ${err}`);
    res.status(500).render("500", { errorMessage: "Error searching vehicle" });
  }
}

export function renderHome(req, res) {
  res.render("index", { selectedEVU: "SBBP", selectedDate: "" });
}

export async function renderRecentSearches(req, res) {
  try {
    const db = getDB();
    const collection = db.collection("formations");

    const recentSearches = await collection
      .find({})
      .sort({ cachedAt: -1 })
      .limit(50)
      .toArray();

    res.render("recent", { recentSearches });
  } catch (err) {
    logger.error(`Error fetching recent searches: ${err}`);

    if (err.name === "MongoNetworkTimeoutError" || err.code === "ETIMEDOUT") {
      return res
        .status(504)
        .render("504", { errorMessage: "Connection timed out" });
    }

    res
      .status(500)
      .render("500", { errorMessage: "Failed to load recent searches" });
  }
}

export function renderAbout(req, res) {
  res.render("about");
}
