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
}

export interface CollectionFilters {
  search?: string;
  fraction?: WasteFraction | "all";
  status?: CollectionStatus | "all";
  operator?: string;
  stationId?: string;
}

export interface RouteFilters {
  status?: RouteStatus | "all";
}

export interface SessionsService {
  list(f?: SessionFilters): Promise<AccessSession[]>;
  get(id: string): Promise<AccessSession | undefined>;
}

export interface CollectionsService {
  list(f?: CollectionFilters): Promise<Collection[]>;
  get(id: string): Promise<Collection | undefined>;
}

export interface RoutesService {
  list(f?: RouteFilters): Promise<CollectionRoute[]>;
  get(id: string): Promise<CollectionRoute | undefined>;
  optimize(stationIds: string[]): Promise<CollectionRoute>;
}

export interface VehiclesService {
  list(): Promise<Vehicle[]>;
}
