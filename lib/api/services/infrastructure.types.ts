import type {
  BinStation,
  Container,
  Cooperative,
  DataSource,
  DeploymentVariant,
  FillStatus,
  Property,
  Unit,
  WasteFraction,
} from "@/lib/types";

/**
 * Shared filter shapes + the infrastructure service contract. Both the mock
 * and the real implementation satisfy `InfrastructureServices`, so the switch
 * in `infrastructure.ts` (and every hook/component above it) is type-checked
 * against one interface.
 */

export interface CooperativeFilters {
  search?: string;
  district?: string;
  variant?: DeploymentVariant | "all";
}

export interface PropertyFilters {
  search?: string;
  cooperativeId?: string;
}

export interface StationFilters {
  search?: string;
  cooperativeId?: string;
  district?: string;
  variant?: DeploymentVariant | "all";
  status?: BinStation["status"] | "all";
  hasCamera?: boolean;
}

export interface ContainerFilters {
  search?: string;
  stationId?: string;
  cooperativeId?: string;
  fraction?: WasteFraction | "all";
  status?: FillStatus | "all";
  dataSource?: DataSource | "all";
}

export interface FillHistoryPoint {
  label: string;
  value: number;
}

export interface CooperativesService {
  list(f?: CooperativeFilters): Promise<Cooperative[]>;
  get(id: string): Promise<Cooperative | undefined>;
}

export interface PropertiesService {
  list(f?: PropertyFilters): Promise<Property[]>;
  get(id: string): Promise<Property | undefined>;
}

export interface UnitsService {
  list(propertyId: string): Promise<Unit[]>;
  issueKey(unitId: string): Promise<Unit>;
  revokeKey(unitId: string): Promise<Unit>;
}

export interface StationsService {
  list(f?: StationFilters): Promise<BinStation[]>;
  get(id: string): Promise<BinStation | undefined>;
}

export interface ContainersService {
  list(f?: ContainerFilters): Promise<Container[]>;
  get(id: string): Promise<Container | undefined>;
  history(id: string, days?: number): Promise<FillHistoryPoint[]>;
}
