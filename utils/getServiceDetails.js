import fetch from "node-fetch";

const OTD_AUTH = process.env.OTD_AUTH;
const OTD_VEHICLE_ENDPOINT = process.env.OTD_VEHICLE_ENDPOINT;

export async function getServiceDetails(evu, operationDate, trainNumber) {
  const reqUrl = `${OTD_VEHICLE_ENDPOINT}?evu=${evu}&operationDate=${operationDate}&trainNumber=${trainNumber}`;

  const response = await fetch(reqUrl, {
    headers: { Authorization: OTD_AUTH },
  });

  const status = response.status;

  let service = {};
  if (status === 200) {
    service = await response.json();
  }

  return { service, status };
}
