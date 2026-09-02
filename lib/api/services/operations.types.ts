import type {
  AccessSession,
  Collection,
  CollectionRoute,
  CollectionStatus,
  RouteStatus,
  Vehicle,
  WasteFraction,
} from "@/lib/types";

/** Filter shapes + service contract shared by the mock and real operations impls. */

export interface SessionFilters {
  search?: string;
  stationId?: string;
  anomaly?: boolean;
  hasRecording?: boolean;
  /** Server-side date range (From/To on /v1/access-sessions). */
  from?: string;
  to?: string;
}

export interface CollectionFilters {
  search?: string;
  fraction?: WasteFraction | "all";
  status?: CollectionStatus | "all";
  operator?: string;
  stationId?: string;
  /** Server-side date range (From/To on /v1/collections). */
  from?: string;
  to?: string;
}

export interface RouteFilters {
  status?: RouteStatus | "all";
  from?: string;
  to?: string;
}

/* ---- Write payloads ---------------------------------------------- */

export interface RegisterCollectionInput {
  stationCode: string;
  containerCode?: string | null;
  operatorName?: string | null;
  vehicleId?: string | null;
  routeId?: string | null;
  collectedAt?: string | null;
  levelBefore?: number | null;
  levelAfter?: number | null;
  note?: string | null;
}

export interface RouteInput {
  date: string;
  operatorName?: string | null;
  vehicleId?: string | null;
}

export interface VehicleInput {
  code: string;
  operatorName?: string | null;
  nominalCapacityUnits?: number | null;
}

export interface SessionsService {
  list(f?: SessionFilters): Promise<AccessSession[]>;
  get(id: string): Promise<AccessSession | undefined>;
}

export interface CollectionsService {
  list(f?: CollectionFilters): Promise<Collection[]>;
  get(id: string): Promise<Collection | undefined>;
  register(input: RegisterCollectionInput): Promise<string>;
}

export interface RoutesService {
  list(f?: RouteFilters): Promise<CollectionRoute[]>;
  get(id: string): Promise<CollectionRoute | undefined>;
  optimize(stationIds: string[]): Promise<CollectionRoute>;
  plan(input: RouteInput): Promise<string>;
}

export interface VehiclesService {
  list(): Promise<Vehicle[]>;
  create(input: VehicleInput): Promise<string>;
}
