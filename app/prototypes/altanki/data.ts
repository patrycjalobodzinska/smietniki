import type { BinStation, WasteFraction } from "@/lib/types";

/**
 * Statyczne dane wyłącznie dla prototypu (app/prototypes/*). Kształt zgodny z
 * produkcyjnymi typami, żeby warianty mogły używać prawdziwych komponentów
 * domenowych. Nic produkcyjnego tego nie importuje.
 */

export interface ProtoContainer {
  id: string;
  code: string;
  fraction: WasteFraction;
  fillLevel: number | null;
  capacityL: number;
}

export interface ProtoStation extends BinStation {
  containers: ProtoContainer[];
  openings24h: number;
}

let seq = 0;
function cont(stationCode: string, fraction: WasteFraction, fillLevel: number | null, capacityL = 1100): ProtoContainer {
  seq += 1;
  return { id: `c${seq}`, code: `${stationCode}-${fraction.slice(0, 2).toUpperCase()}`, fraction, fillLevel, capacityL };
}

function station(s: {
  code: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  variant: ProtoStation["deploymentVariant"];
  status: ProtoStation["status"];
  hasCamera: boolean;
  openings24h: number;
  lastSessionAt: string | null;
  lastCollectionAt: string | null;
  containers: Array<[WasteFraction, number | null]>;
}): ProtoStation {
  const containers = s.containers.map(([f, v]) => cont(s.code, f, v));
  const measured = containers.filter((c) => typeof c.fillLevel === "number");
  return {
    id: s.code.toLowerCase(),
    code: s.code,
    name: s.name,
    address: s.address,
    district: s.district,
    location: { lat: s.lat, lng: s.lng },
    cooperativeId: "coop-1",
    status: s.status,
    deploymentVariant: s.variant,
    accessMode: "rfid",
    hasCamera: s.hasCamera,
    containerCount: containers.length,
    avgFillLevel: measured.length
      ? Math.round(measured.reduce((a, c) => a + (c.fillLevel as number), 0) / measured.length)
      : null,
    fillDataSource: measured.length ? "auto" : "none",
    lastCollectionAt: s.lastCollectionAt,
    lastSessionAt: s.lastSessionAt,
    containers,
    openings24h: s.openings24h,
  };
}

export const STATIONS: ProtoStation[] = [
  station({
    code: "ALT-002", name: "Podwisłocze 12", address: "Podwisłocze 12", district: "Nowe Miasto",
    lat: 50.0335, lng: 22.0141, variant: "access_fill_vision", status: "attention", hasCamera: true,
    openings24h: 87, lastSessionAt: "2026-09-05T18:41:00Z", lastCollectionAt: "2026-09-02T06:15:00Z",
    containers: [["mixed", 97], ["plastic", 91], ["paper", 78], ["glass", 44], ["bio", 88]],
  }),
  station({
    code: "ALT-005", name: "Rejtana 34", address: "Rejtana 34", district: "Nowe Miasto",
    lat: 50.0248, lng: 22.0193, variant: "access_fill", status: "attention", hasCamera: false,
    openings24h: 64, lastSessionAt: "2026-09-05T17:02:00Z", lastCollectionAt: "2026-09-03T05:50:00Z",
    containers: [["mixed", 94], ["plastic", 62], ["paper", 55], ["glass", 31]],
  }),
  station({
    code: "ALT-011", name: "Krakowska 8", address: "Krakowska 8", district: "Śródmieście",
    lat: 50.0402, lng: 21.9938, variant: "access_fill_vision", status: "active", hasCamera: true,
    openings24h: 112, lastSessionAt: "2026-09-05T18:55:00Z", lastCollectionAt: "2026-09-04T06:05:00Z",
    containers: [["mixed", 71], ["plastic", 83], ["paper", 40], ["glass", 22], ["bio", 66]],
  }),
  station({
    code: "ALT-014", name: "Hetmańska 21", address: "Hetmańska 21", district: "Śródmieście",
    lat: 50.0361, lng: 22.0057, variant: "access_fill", status: "active", hasCamera: false,
    openings24h: 41, lastSessionAt: "2026-09-05T15:20:00Z", lastCollectionAt: "2026-09-04T06:40:00Z",
    containers: [["mixed", 58], ["plastic", 47], ["paper", 33], ["glass", 18]],
  }),
  station({
    code: "ALT-018", name: "Lwowska 76", address: "Lwowska 76", district: "Wschód",
    lat: 50.0446, lng: 22.0281, variant: "access", status: "active", hasCamera: false,
    openings24h: 29, lastSessionAt: "2026-09-05T13:11:00Z", lastCollectionAt: null,
    containers: [["mixed", null], ["plastic", null], ["paper", null]],
  }),
  station({
    code: "ALT-021", name: "Dąbrowskiego 45", address: "Dąbrowskiego 45", district: "Śródmieście",
    lat: 50.0289, lng: 21.9986, variant: "access_fill", status: "active", hasCamera: false,
    openings24h: 55, lastSessionAt: "2026-09-05T16:48:00Z", lastCollectionAt: "2026-09-04T05:30:00Z",
    containers: [["mixed", 82], ["plastic", 74], ["paper", 61], ["glass", 27], ["bio", 49]],
  }),
  station({
    code: "ALT-026", name: "Ofiar Katynia 3", address: "Ofiar Katynia 3", district: "Baranówka",
    lat: 50.0201, lng: 21.9789, variant: "access_fill_vision", status: "active", hasCamera: true,
    openings24h: 96, lastSessionAt: "2026-09-05T18:12:00Z", lastCollectionAt: "2026-09-03T06:20:00Z",
    containers: [["mixed", 45], ["plastic", 38], ["paper", 24], ["glass", 12], ["bio", 30]],
  }),
  station({
    code: "ALT-029", name: "Kwiatkowskiego 14", address: "Kwiatkowskiego 14", district: "Baranówka",
    lat: 50.0157, lng: 21.9841, variant: "access_fill", status: "inactive", hasCamera: false,
    openings24h: 0, lastSessionAt: "2026-08-28T09:05:00Z", lastCollectionAt: "2026-08-29T06:00:00Z",
    containers: [["mixed", 12], ["plastic", 8], ["paper", 5]],
  }),
  station({
    code: "ALT-033", name: "Solidarności 9", address: "Solidarności 9", district: "Zalesie",
    lat: 50.0518, lng: 22.0154, variant: "access_fill", status: "attention", hasCamera: false,
    openings24h: 73, lastSessionAt: "2026-09-05T18:33:00Z", lastCollectionAt: "2026-09-02T05:45:00Z",
    containers: [["mixed", 99], ["plastic", 96], ["paper", 84], ["glass", 67]],
  }),
  station({
    code: "ALT-037", name: "Paderewskiego 52", address: "Paderewskiego 52", district: "Zalesie",
    lat: 50.0563, lng: 22.0092, variant: "access", status: "active", hasCamera: false,
    openings24h: 34, lastSessionAt: "2026-09-05T14:27:00Z", lastCollectionAt: null,
    containers: [["mixed", null], ["plastic", null]],
  }),
  station({
    code: "ALT-041", name: "Wyspiańskiego 6", address: "Wyspiańskiego 6", district: "Wschód",
    lat: 50.0471, lng: 22.0338, variant: "access_fill_vision", status: "active", hasCamera: true,
    openings24h: 68, lastSessionAt: "2026-09-05T17:59:00Z", lastCollectionAt: "2026-09-04T06:10:00Z",
    containers: [["mixed", 64], ["plastic", 52], ["paper", 71], ["glass", 39], ["bio", 58]],
  }),
  station({
    code: "ALT-044", name: "Broniewskiego 18", address: "Broniewskiego 18", district: "Nowe Miasto",
    lat: 50.0312, lng: 22.0231, variant: "access_fill", status: "active", hasCamera: false,
    openings24h: 47, lastSessionAt: "2026-09-05T16:05:00Z", lastCollectionAt: "2026-09-04T05:55:00Z",
    containers: [["mixed", 36], ["plastic", 29], ["paper", 44], ["glass", 15]],
  }),
];

/** "18:41" / "wczoraj 06:15" - lekki formatter tylko dla prototypu. */
export function shortTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const now = new Date("2026-09-05T19:00:00Z");
  const hh = `${d.getUTCHours()}`.padStart(2, "0");
  const mm = `${d.getUTCMinutes()}`.padStart(2, "0");
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return `${hh}:${mm}`;
  if (days === 1) return `wczoraj ${hh}:${mm}`;
  return `${days} dni temu`;
}
