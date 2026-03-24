export const evuMap = {
  SBBP: "SBB",
  BLSP: "BLS",
  MBC: "MBC",
  OeBB: "ÖBB",
  RhB: "RhB",
  SOB: "SOB",
  THURBO: "THURBO",
  TPF: "TPF",
  TRN: "TRN",
  VDBB: "VDBB",
  ZB: "ZB",
};

export const reverseEvuMap = Object.fromEntries(
  Object.entries(evuMap).map(([key, value]) => [value, key]),
);

export function getDisplayEVU(evuCode) {
  return evuMap[evuCode] || evuCode;
}

export function getActualEVU(evuCode) {
  return reverseEvuMap[evuCode] || evuCode;
}
