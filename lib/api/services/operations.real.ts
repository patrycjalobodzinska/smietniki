import type { AccessSession, Collection, CollectionRoute, Vehicle } from "@/lib/types";
import { getPagedItems, http } from "@/lib/api/client";
import {
  mapCollection,
  mapRoute,
  mapSession,
  mapVehicle,
  toFraction,
  type AccessSessionDto,
  type BinStationDto,
  type CollectionDto,
  type ContainerDto,
  type ContainerRef,
  type RouteDto,
  type StationRef,
  type VehicleDto,
} from "@/lib/api/mappers";
import type {
  CollectionFilters,
  CollectionsService,
  RouteFilters,
  RoutesService,
  SessionFilters,
  SessionsService,
  VehiclesService,
} from "@/lib/api/services/operations.types";

/**
 * Operations services backed by the live SprigaAPI. The API references stations
 * and containers by code and offers no per-item detail endpoints, so codes are
 * resolved via bulk lookups and get(id) is a list+find. Filters not supported
 * server-side are applied client-side.
 */

const includesCI = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase());

async function stationRefByCode(): Promise<Map<string, StationRef>> {
  const stations = await getPagedItems<BinStationDto>("/v1/bin-stations");
  return new Map(stations.map((s) => [s.code, { id: s.id, name: s.name }]));
}

async function containerRefByCode(): Promise<Map<string, ContainerRef>> {
  const containers = await getPagedItems<ContainerDto>("/v1/containers");
  return new Map(containers.map((c) => [c.code, { id: c.id, fraction: toFraction(c.fractionType) }]));
}

/* ---- Sessions (access-sessions) ----------------------------------- */

export const sessionsService: SessionsService = {
  async list(f: SessionFilters = {}): Promise<AccessSession[]> {
    const [dtos, stations] = await Promise.all([
      getPagedItems<AccessSessionDto>("/v1/access-sessions"),
      stationRefByCode(),
    ]);
    let out = dtos
      .map((d) => mapSession(d, stations))
      .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
    if (f.search) out = out.filter((s) => includesCI(s.keyIdentifier, f.search!) || includesCI(s.stationName, f.search!));
    if (f.stationId) out = out.filter((s) => s.stationId === f.stationId);
    if (f.anomaly !== undefined) out = out.filter((s) => s.anomaly === f.anomaly);
    if (f.hasRecording !== undefined) out = out.filter((s) => s.hasRecording === f.hasRecording);
    return out;
  },
  async get(id: string) {
    return (await this.list()).find((s) => s.id === id);
  },
};

/* ---- Collections -------------------------------------------------- */

export const collectionsService: CollectionsService = {
  async list(f: CollectionFilters = {}): Promise<Collection[]> {
    const [dtos, stations, containers] = await Promise.all([
      getPagedItems<CollectionDto>("/v1/collections"),
      stationRefByCode(),
      containerRefByCode(),
    ]);
    let out = dtos
      .map((d) => mapCollection(d, stations, containers))
      .sort((a, b) => +new Date(b.collectedAt) - +new Date(a.collectedAt));
    if (f.search) out = out.filter((c) => includesCI(c.stationName, f.search!));
    if (f.fraction && f.fraction !== "all") out = out.filter((c) => c.fraction === f.fraction);
    if (f.status && f.status !== "all") out = out.filter((c) => c.status === f.status);
    if (f.operator) out = out.filter((c) => c.operator === f.operator);
    if (f.stationId) out = out.filter((c) => c.stationId === f.stationId);
    return out;
  },
  async get(id: string) {
    return (await this.list()).find((c) => c.id === id);
  },
};

/* ---- Routes ------------------------------------------------------- */

export const routesService: RoutesService = {
  async list(f: RouteFilters = {}): Promise<CollectionRoute[]> {
    const dtos = await getPagedItems<RouteDto>("/v1/routes");
    let out = dtos.map(mapRoute).sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (f.status && f.status !== "all") out = out.filter((r) => r.status === f.status);
    return out;
  },
  async get(id: string) {
    // No GET /routes/{id} — resolve from the list.
    const dtos = await getPagedItems<RouteDto>("/v1/routes");
    const dto = dtos.find((r) => r.id === id);
    return dto ? mapRoute(dto) : undefined;
  },
  // The API's POST /routes only accepts date/operator/vehicle (no stops), so
  // stationIds can't be sent — it creates a header route we then resolve by id.
  async optimize(_stationIds: string[]): Promise<CollectionRoute> {
    const date = new Date().toISOString();
    const id = await http.post<string>("/v1/routes", { date, operatorName: null, vehicleId: null });
    const dtos = await getPagedItems<RouteDto>("/v1/routes");
    const dto = dtos.find((r) => r.id === id);
    return mapRoute(dto ?? { id, date, operatorName: null, vehicleId: null, status: "Planned" });
  },
};

/* ---- Vehicles ----------------------------------------------------- */

export const vehiclesService: VehiclesService = {
  async list(): Promise<Vehicle[]> {
    const dtos = await getPagedItems<VehicleDto>("/v1/vehicles");
    return dtos.map(mapVehicle);
  },
};
