export function formatEVN(evnString) {
  if (!evnString) {
    return "Unknown vehicle";
  }

  // Clean the input (remove spaces etc.)
  let cleaned = evnString.replace(/\D+/g, "");

  // Check to see if check digit is separated by -
  if (cleaned.match(/^(\d{12})$/)) {
    cleaned = cleaned.slice(0, -1) + "-" + cleaned.slice(-1);
  }

  // Match 11 digits + 1 check digit
  const match = cleaned.match(/^(\d{11})-(\d)$/);
  if (!match) return evnString;

  const digits = match[1];
  const checkDigit = match[2];

  const vehicleType = digits.slice(0, 2);
  const countryCode = digits.slice(2, 4);

  // Locomotive format
  if (vehicleType.startsWith("9")) {
    const tractionType = digits[4];
    const series = digits.slice(5, 8);
    const number = digits.slice(8, 11);

    // Because Austria is weird..
    const obbSep = countryCode === "81" ? "" : " ";

    return `${vehicleType} ${countryCode} ${tractionType}${obbSep}${series} ${number}-${checkDigit}`;
  }

  // Coach/wagon format
  const part1 = digits.slice(4, 6);
  const part2 = digits.slice(6, 8);
  const number = digits.slice(8, 11);

  return `${vehicleType} ${countryCode} ${part1}-${part2} ${number}-${checkDigit}`;
}
