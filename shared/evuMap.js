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

export function getDisplayEVU(evuCode) {
  return evuMap[evuCode] || evuCode;
}
