import { DateTime } from "luxon";

const ALLOWED_EVUS = [
  "SBBP",
  "BLSP",
  "MBC",
  "OeBB",
  "RhB",
  "SOB",
  "THURBO",
  "TPF",
  "TRN",
  "VDBB",
  "ZB",
];

export function validateInputs({ evu, operationDate, trainNumber }) {
  const errors = [];

  // Firstly make sure the EVU is on the list
  let evuSanitized = evu.trim().toUpperCase();

  if (
    !/^[A-Z]{2,6}$/.test(evuSanitized) ||
    !ALLOWED_EVUS.includes(evuSanitized)
  ) {
    // Because these ones have a lowercase character..
    if (evuSanitized == "OEBB") {
      evuSanitized = "OeBB";
    } else if (evuSanitized == "RHB") {
      evuSanitized = "RhB";
    } else {
      errors.push("Error: Invalid EVU code. ");
    }
  }

  // Check that the date is within the range accessible by the API
  const inputDate = DateTime.fromISO(operationDate, { zone: "Europe/Zurich" });
  const now = DateTime.now().setZone("Europe/Zurich").startOf("day");
  const diff = inputDate.diff(now, "days").days;

  if (!inputDate.isValid || diff < 0 || diff > 2) {
    errors.push("Error: Invalid operation date. ");
  }

  // Check the train number contains only digits
  const trainNumSanitized = trainNumber.trim();
  if (
    !/^\d{1,6}$/.test(trainNumSanitized) ||
    trainNumSanitized.startsWith("0")
  ) {
    errors.push("Error: Train number must be an integer. ");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      evu: evuSanitized,
      operationDate: inputDate.toISODate(),
      trainNumber: parseInt(trainNumSanitized, 10),
    },
  };
}
