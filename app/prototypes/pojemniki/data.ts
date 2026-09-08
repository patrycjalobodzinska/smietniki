import type { Container, FillStatus, WasteFraction } from "@/lib/types";

/** Dane wyłącznie dla prototypu. Kształt zgodny z produkcyjnym `Container`. */

export interface ProtoContainer extends Container {
  stationName: string;
  stationCode: string;
}

const NOW = new Date("2026-09-06T09:00:00Z");

/** ISO przesunięte o godziny od "teraz" prototypu. */
const inHours = (h: number | null) =>
  h === null ? null : new Date(NOW.getTime() + h * 3_600_000).toISOString();

function statusOf(fill: number | null): FillStatus {
  if (fill === null) return "no_data";
  if (fill < 20) return "empty";
  if (fill < 60) return "normal";
  if (fill < 75) return "rising";
  if (fill < 90) return "high";
  return "critical";
}

let seq = 0;
function c(
  stationCode: string,
  stationName: string,
  fraction: WasteFraction,
  fillLevel: number | null,
  fullInHours: number | null,
  capacityL = 1100,
  sensorOk = true,
): ProtoContainer {
  seq += 1;
  const suffix = { paper: "PA", plastic: "PL", glass: "SZ", bio: "BI", mixed: "ZM", other: "IN" }[fraction];
  return {
    id: `c${seq}`,
    code: `${stationCode}-${suffix}`,
    stationId: stationCode.toLowerCase(),
    stationName,
    stationCode,
    cooperativeId: "coop-1",
    fraction,
    capacityL,
    fillLevel,
    fillStatus: statusOf(fillLevel),
    dataSource: fillLevel === null ? "none" : sensorOk ? "auto" : "manual",
    sensorOk,
    lastMeasurementAt: fillLevel === null ? null : inHours(-2),
    lastCollectionAt: inHours(-52),
    predictedFullAt: inHours(fullInHours),
  };
}

export const CONTAINERS: ProtoContainer[] = [
  c("RZE-PODW-12", "Podwisłocze 12", "mixed", 97, 2),
  c("RZE-PODW-12", "Podwisłocze 12", "plastic", 91, 6),
  c("RZE-PODW-12", "Podwisłocze 12", "paper", 78, 26),
  c("RZE-PODW-12", "Podwisłocze 12", "glass", 44, 120),
  c("RZE-PODW-12", "Podwisłocze 12", "bio", 88, 9, 660),

  c("RZE-REJT-34", "Rejtana 34", "mixed", 94, 4),
  c("RZE-REJT-34", "Rejtana 34", "plastic", 62, 52),
  c("RZE-REJT-34", "Rejtana 34", "paper", 55, 74),
  c("RZE-REJT-34", "Rejtana 34", "glass", 31, 168),

  c("RZE-KRAK-08", "Krakowska 8", "mixed", 71, 30),
  c("RZE-KRAK-08", "Krakowska 8", "plastic", 83, 14),
  c("RZE-KRAK-08", "Krakowska 8", "paper", 40, 110),
  c("RZE-KRAK-08", "Krakowska 8", "bio", 66, 21, 660),

  c("RZE-SOLI-09", "Solidarności 9", "mixed", 99, 1),
  c("RZE-SOLI-09", "Solidarności 9", "plastic", 96, 3),
  c("RZE-SOLI-09", "Solidarności 9", "paper", 84, 18),
  c("RZE-SOLI-09", "Solidarności 9", "glass", 67, 60),

  c("RZE-HETM-21", "Hetmańska 21", "mixed", 58, 66),
  c("RZE-HETM-21", "Hetmańska 21", "plastic", 47, 90),
  c("RZE-HETM-21", "Hetmańska 21", "paper", 33, 140),

  c("RZE-KATY-03", "Ofiar Katynia 3", "mixed", 45, 96),
  c("RZE-KATY-03", "Ofiar Katynia 3", "plastic", 38, 130),
  c("RZE-KATY-03", "Ofiar Katynia 3", "bio", 30, 150, 660),

  c("RZE-LWOW-76", "Lwowska 76", "mixed", null, null, 1100, false),
  c("RZE-LWOW-76", "Lwowska 76", "plastic", null, null, 1100, false),

  c("RZE-BRON-18", "Broniewskiego 18", "mixed", 36, 118),
  c("RZE-BRON-18", "Broniewskiego 18", "paper", 44, 104, 660),
  c("RZE-BRON-18", "Broniewskiego 18", "glass", 15, 200),
];

/** Godziny do przepełnienia; null gdy brak prognozy. */
export function hoursToFull(c: ProtoContainer): number | null {
  if (!c.predictedFullAt) return null;
  return (new Date(c.predictedFullAt).getTime() - NOW.getTime()) / 3_600_000;
}

export function formatEta(hours: number | null): string {
  if (hours === null) return "brak prognozy";
  if (hours < 1) return "poniżej godziny";
  if (hours < 24) return `za ${Math.round(hours)} h`;
  const days = Math.round(hours / 24);
  return `za ${days} ${days === 1 ? "dzień" : "dni"}`;
}
