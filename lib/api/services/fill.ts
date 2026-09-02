import { getPagedItems, http } from "@/lib/api/client";
import { toDataSource } from "@/lib/api/mappers";
import type { FillMeasurement } from "@/lib/types";

/**
 * Fill telemetry (GET /v1/fill/measurements, POST /v1/fill/manual-measurement).
 *
 * The measurement feed is the raw source behind every fill level in the app;
 * the manual entry is how Access-only altankas (no sensor) get a level at all.
 */

interface FillMeasurementDto {
  id: string;
  deviceKey: string | null;
  containerCode: string | null;
  source: string;
  value: number;
  measuredAt: string;
  rawEventId: string | null;
}

function mapMeasurement(d: FillMeasurementDto): FillMeasurement {
  return {
    id: d.id,
    deviceKey: d.deviceKey ?? null,
    containerCode: d.containerCode ?? null,
    source: toDataSource(d.source),
    value: Math.round(d.value),
    measuredAt: d.measuredAt,
    rawEventId: d.rawEventId ?? null,
  };
}

export interface FillMeasurementFilters {
  /** Server-side filters supported by the API. */
  deviceKey?: string;
  containerCode?: string;
  from?: string;
  to?: string;
  /** Client-side: source has no server-side filter. */
  source?: FillMeasurement["source"] | "all";
  limit?: number;
}

export interface ManualMeasurementInput {
  containerCode: string;
  value: number;
  /** ISO timestamp; defaults to now on the server when omitted. */
  measuredAt?: string | null;
}

export const fillService = {
  async measurements(f: FillMeasurementFilters = {}): Promise<FillMeasurement[]> {
    const dtos = await getPagedItems<FillMeasurementDto>("/v1/fill/measurements", {
      DeviceKey: f.deviceKey,
      ContainerCode: f.containerCode,
      From: f.from,
      To: f.to,
    });
    let out = dtos
      .map(mapMeasurement)
      .sort((a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt));
    if (f.source && f.source !== "all") out = out.filter((m) => m.source === f.source);
    if (f.limit) out = out.slice(0, f.limit);
    return out;
  },

  addManual(input: ManualMeasurementInput): Promise<void> {
    return http.post<void>("/v1/fill/manual-measurement", {
      containerCode: input.containerCode,
      value: Math.round(input.value),
      measuredAt: input.measuredAt ?? null,
    });
  },
};
