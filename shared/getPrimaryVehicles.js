import { formatEVN } from "./formatEVN.js";

export function getPrimaryVehicles(vehicles) {
  const primaryVehicles = [];

  vehicles.forEach((vehicle) => {
    // Sometimes neither the 'evn' or 'parentEvn' fields are filled, but the separate fields are..
    const backupEvn =
      vehicle.vehicleIdentifier.buildTypeCode &&
      vehicle.vehicleIdentifier.countryCode &&
      vehicle.vehicleIdentifier.vehicleNumber &&
      vehicle.vehicleIdentifier.checkNumber
        ? vehicle.vehicleIdentifier.buildTypeCode +
          vehicle.vehicleIdentifier.countryCode +
          vehicle.vehicleIdentifier.vehicleNumber +
          vehicle.vehicleIdentifier.checkNumber
        : `Unknown vehicle (type ${vehicle.vehicleIdentifier.typeCodeName})`;

    // Get the EVN but work with just the digits
    const vehicleEvn = formatEVN(
      vehicle.vehicleIdentifier.evn ||
        vehicle.vehicleIdentifier.parentEvn ||
        backupEvn,
    ).replace(/\D/g, "");

    /* Some vehicles are primary vehicles even if the EVN does not start with '9', this is handled per operator
       RhB locos always start 80850000
       OeBB locos will start 9181
       SBB/BLS locos will start 91854
       ZB locos will start 9085
       SBB/SOB/THURBO/ZB units will start 9385 or 9485
       BLS units will start 00005 or 000075. 515s/525s need to be 5150xx/5250xx
       RhB units are weird, they will start 8085 but the EVN contains an extra 0

       The vehicles are formatted appropriately. Sometimes on units the set number is unique to the individual vehicle numbers (such as BLS 515s)*/

    const extractionRules = [
      {
        prefix: "80850000",
        extract: (s) => s.substring(8, 11),
      },
      {
        prefix: "9181",
        extract: (s) => s.substring(4, 11),
      },
      {
        prefixes: ["94857515", "000005251"],
        extract: (s) => s.substring(5, 8) + "0" + s.substring(9, 11),
      },
      {
        prefixes: [
          "9085",
          "9180",
          "91854",
          "938515010",
          "93851503",
          "938556101",
          "9485",
          "000005281",
          "000005351",
          "000075281",
        ],
        extract: (s) => s.substring(5, 11),
      },
      {
        prefix: "8085003",
        extract: (s) => s.substring(6, 8) + s.substring(9, 11),
      },
    ];

    for (const rule of extractionRules) {
      const prefixes = rule.prefixes || [rule.prefix];
      if (prefixes.some((p) => vehicleEvn.startsWith(p))) {
        primaryVehicles.push(rule.extract(vehicleEvn));
        break;
      }
    }
  });

  if (primaryVehicles.length == 0) {
    return "No loco/unit found";
  }

  // Remove duplicates
  const uniquePrimaryVehicles = [...new Set(primaryVehicles)];

  return uniquePrimaryVehicles;
}
