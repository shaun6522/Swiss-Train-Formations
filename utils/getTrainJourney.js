export function getTrainJourney(formations) {
  try {
    const vehicleStops =
      formations?.[0]?.formationVehicles?.[0]?.formationVehicleAtScheduledStops;

    if (!Array.isArray(vehicleStops) || vehicleStops.length === 0) {
      return "Journey data unavailable";
    }

    const stopCount = vehicleStops.length;
    const serviceOrigin = vehicleStops[0].stopPoint?.name || "Unknown origin";
    const serviceDestination =
      vehicleStops[stopCount - 1].stopPoint?.name || "Unknown destination";

    const departureTimeRaw = vehicleStops[0].stopTime?.departureTime || "";
    const reTime = /(?<=T)\d\d:\d\d(?=:\d\d)/;
    const match = reTime.exec(departureTimeRaw);
    const serviceDepartureTime = match ? match[0] : "??:??";

    return `${serviceDepartureTime} ${serviceOrigin} to ${serviceDestination}`;
  } catch (error) {
    console.error("Error in getTrainJourney:", error);
    return "Journey data unavailable";
  }
}
