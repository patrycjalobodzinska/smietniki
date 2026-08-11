import type {
  BinStation,
  Container,
  Cooperative,
  DeploymentVariant,
  Property,
  Unit,
} from "@/lib/types";
import { ApiError, getPagedItems, http } from "@/lib/api/client";
import {
  mapContainer,
  mapCooperative,
  mapProperty,
  mapStation,
  mapUnit,
  toDeploymentVariant,
  type AccessKeyDto,
  type BinStationDto,
  type ContainerDto,
  type CooperativeDto,
  type PropertyDto,
  type UnitDto,
} from "@/lib/api/mappers";
import type {
  ContainerFilters,
  ContainersService,
  CooperativeFilters,
  CooperativesService,
  FillHistoryPoint,
  PropertiesService,
  PropertyFilters,
  StationFilters,
  StationsService,
  UnitsService,
} from "@/lib/api/services/infrastructure.types";

/**
 * Infrastructure services backed by the live SprigaAPI.
 *
 * Bin stations + containers (KM1) do NOT depend on /v1/properties, so they load
 * even on a stage where that endpoint is missing. The cooperatives/properties/
 * units services (used only by the hidden "full mode" modules) do read
 * /v1/properties — but only when their own hooks are called.
 */

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

/** The bin-stations LIST omits cooperativeId; recover it via properties. */
function buildStationCoopMap(properties: PropertyDto[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of properties) {
    if (p.assignedBinStationId) map.set(p.assignedBinStationId, p.cooperativeId);
  }
  return map;
}

/* ---- Cooperatives (full mode) ------------------------------------- */

async function enrichCooperatives(coops: CooperativeDto[]): Promise<Cooperative[]> {
  const [properties, stations, containers] = await Promise.all([
    getPagedItems<PropertyDto>("/v1/properties"),
    getPagedItems<BinStationDto>("/v1/bin-stations"),
    getPagedItems<ContainerDto>("/v1/containers"),
  ]);
  const stationToCoop = buildStationCoopMap(properties);

  return coops.map((c) => {
    const props = properties.filter((p) => p.cooperativeId === c.id);
    const coopStations = stations.filter((s) => stationToCoop.get(s.id) === c.id);
    const measured = containers.filter(
      (ct) => stationToCoop.get(ct.binStationId) === c.id && typeof ct.fillLevel === "number",
    );
    const avgFillLevel = measured.length
      ? Math.round(measured.reduce((s, ct) => s + (ct.fillLevel as number), 0) / measured.length)
      : null;
    const variantCounts = groupBy(coopStations, (s) => s.deploymentVariant);
    const dominant = [...variantCounts.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0];

    return mapCooperative(c, {
      propertyCount: props.length,
      unitCount: props.reduce((s, p) => s + (p.unitsCount ?? 0), 0),
      stationCount: coopStations.length,
      activeKeys: 0,
      avgFillLevel,
      deploymentMix: dominant ? toDeploymentVariant(dominant) : "access",
    });
  });
}

export const cooperativesService: CooperativesService = {
  async list(f: CooperativeFilters = {}): Promise<Cooperative[]> {
    const dtos = await getPagedItems<CooperativeDto>("/v1/cooperatives", { Search: f.search });
    let out = await enrichCooperatives(dtos);
    if (f.district) out = out.filter((c) => c.district === f.district);
    if (f.variant && f.variant !== "all") out = out.filter((c) => c.deploymentMix === f.variant);
    return out;
  },
  get(id: string) {
    return undefinedOn404(async () => {
      const dto = await http.get<CooperativeDto>(`/v1/cooperatives/${id}`);
      return (await enrichCooperatives([dto]))[0];
    });
  },
};

/* ---- Properties (full mode) --------------------------------------- */

export const propertiesService: PropertiesService = {
  async list(f: PropertyFilters = {}): Promise<Property[]> {
    const dtos = await getPagedItems<PropertyDto>("/v1/properties", {
      CooperativeId: f.cooperativeId,
    });
    let out = dtos.map((p) => mapProperty(p));
    if (f.search) out = out.filter((p) => includesCI(p.address, f.search!));
    return out;
  },
  async get(id: string) {
    const dtos = await getPagedItems<PropertyDto>("/v1/properties");
    const dto = dtos.find((p) => p.id === id);
    return dto ? mapProperty(dto) : undefined;
  },
};

/* ---- Units + keys (full mode) ------------------------------------- */

function stubUnit(unitId: string): Unit {
  return {
    id: unitId,
    propertyId: "",
    unitNumber: "",
    residentsCount: 0,
    keysLimit: 0,
    activeKeys: 0,
    keyTypes: [],
    lastUsedAt: null,
    status: "active",
  };
}

export const unitsService: UnitsService = {
  async list(propertyId: string): Promise<Unit[]> {
    const [units, keys] = await Promise.all([
      getPagedItems<UnitDto>("/v1/units", { PropertyId: propertyId }),
      getPagedItems<AccessKeyDto>("/v1/access-keys"),
    ]);
    const keysByUnit = groupBy(keys, (k) => k.unitId);
    return units.map((u) => mapUnit(u, keysByUnit.get(u.id) ?? []));
  },

  async issueKey(unitId: string): Promise<Unit> {
    await http.post("/v1/access-keys", {
      unitId,
      keyType: "Rfid",
      keyIdentifier: `WEB-${Date.now()}`,
    });
    return stubUnit(unitId);
  },

  async revokeKey(unitId: string): Promise<Unit> {
    const keys = await getPagedItems<AccessKeyDto>("/v1/access-keys", { UnitId: unitId });
    const active = keys.find((k) => k.status === "Active");
    if (active) await http.put(`/v1/access-keys/${active.id}/revoke`);
    return stubUnit(unitId);
  },
};

/* ---- Bin stations (KM1 — no /v1/properties) ----------------------- */

export const stationsService: StationsService = {
  async list(f: StationFilters = {}): Promise<BinStation[]> {
    const variant = f.variant && f.variant !== "all" ? DEPLOYMENT_TO_API[f.variant] : undefined;
    const [stations, containers] = await Promise.all([
      getPagedItems<BinStationDto>("/v1/bin-stations", {
        Search: f.search,
        CooperativeId: f.cooperativeId,
        DeploymentVariant: variant,
      }),
      getPagedItems<ContainerDto>("/v1/containers"),
    ]);
    const byStation = groupBy(containers, (c) => c.binStationId);
    let out = stations.map((s) => mapStation(s, byStation.get(s.id) ?? []));
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

/* ---- Containers (KM1 — no /v1/properties) ------------------------- */

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
