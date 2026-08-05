import type { BinStation, Container, DeploymentVariant } from "@/lib/types";
import { ApiError, getPagedItems, http } from "@/lib/api/client";
import {
  mapContainer,
  mapStation,
  type BinStationDto,
  type ContainerDto,
} from "@/lib/api/mappers";
import type {
  ContainerFilters,
  ContainersService,
  FillHistoryPoint,
  StationFilters,
  StationsService,
} from "@/lib/api/services/infrastructure.types";

/**
 * Infrastructure services backed by the live SprigaAPI (KM1 scope: bin stations
 * + containers). The subject layer (cooperatives/properties/units) is out of
 * scope and lives on the `pelny-zakres` branch — nothing here calls
 * /v1/properties, so a stage without that endpoint still loads all data.
 */

/** Reverse of toDeploymentVariant, for the one server-side variant filter. */
const DEPLOYMENT_TO_API: Record<DeploymentVariant, string> = {
  access: "Access",
  access_fill: "AccessFill",
  access_fill_vision: "AccessFillVision",
};

const includesCI = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase());

function groupBy<T, K>(items: T[], key: (t: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const bucket = map.get(k);
    if (bucket) bucket.push(it);
    else map.set(k, [it]);
  }
  return map;
}

async function undefinedOn404<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
}

/* ---- Bin stations ------------------------------------------------- */

export const stationsService: StationsService = {
  async list(f: StationFilters = {}): Promise<BinStation[]> {
    const variant = f.variant && f.variant !== "all" ? DEPLOYMENT_TO_API[f.variant] : undefined;
    const [stations, containers] = await Promise.all([
      getPagedItems<BinStationDto>("/v1/bin-stations", {
        Search: f.search,
        DeploymentVariant: variant,
      }),
      getPagedItems<ContainerDto>("/v1/containers"),
    ]);
    const byStation = groupBy(containers, (c) => c.binStationId);
    let out = stations.map((s) => mapStation(s, byStation.get(s.id) ?? []));
    // Filters the API doesn't support server-side:
    if (f.district) out = out.filter((s) => s.district === f.district);
    if (f.status && f.status !== "all") out = out.filter((s) => s.status === f.status);
    if (f.hasCamera !== undefined) out = out.filter((s) => s.hasCamera === f.hasCamera);
    return out;
  },
  get(id: string) {
    return undefinedOn404(async () => {
      const dto = await http.get<BinStationDto>(`/v1/bin-stations/${id}`);
      return mapStation(dto, dto.containers ?? []);
    });
  },
};

/* ---- Containers --------------------------------------------------- */

export const containersService: ContainersService = {
  async list(f: ContainerFilters = {}): Promise<Container[]> {
    const containers = await getPagedItems<ContainerDto>("/v1/containers", {
      BinStationId: f.stationId,
    });
    let out = containers.map((c) => mapContainer(c, ""));
    if (f.search) out = out.filter((c) => includesCI(c.code, f.search!));
    if (f.fraction && f.fraction !== "all") out = out.filter((c) => c.fraction === f.fraction);
    if (f.status && f.status !== "all") out = out.filter((c) => c.fillStatus === f.status);
    if (f.dataSource && f.dataSource !== "all") out = out.filter((c) => c.dataSource === f.dataSource);
    return out;
  },

  get(id: string) {
    return undefinedOn404(async () => {
      const dto = await http.get<ContainerDto>(`/v1/containers/${id}`);
      return mapContainer(dto, "");
    });
  },

  async history(id: string, days = 7): Promise<FillHistoryPoint[]> {
    const container = await undefinedOn404(() => http.get<ContainerDto>(`/v1/containers/${id}`));
    if (!container) return [];
    const measurements = await getPagedItems<{ value: number; measuredAt: string }>(
      "/v1/fill/measurements",
      { ContainerCode: container.code },
    );
    // Keep the last measurement per calendar day, then the last `days` days.
    const byDay = new Map<string, { value: number; measuredAt: string }>();
    for (const m of measurements) {
      const day = m.measuredAt.slice(0, 10);
      const prev = byDay.get(day);
      if (!prev || m.measuredAt > prev.measuredAt) byDay.set(day, m);
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-days)
      .map(([day, m]) => {
        const [, month, date] = day.split("-");
        return { label: `${date}.${month}`, value: Math.round(m.value) };
      });
  },
};
