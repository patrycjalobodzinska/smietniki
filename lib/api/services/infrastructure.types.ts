import type {
  AccessMode,
  BinStation,
  BuildingType,
  Container,
  Cooperative,
  DataSource,
  DeploymentVariant,
  FillStatus,
  Property,
  StationStatus,
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

/* ---- Write payloads (create/update commands) ---------------------- */

export interface CooperativeInput {
  name: string;
  district?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface PropertyInput {
  cooperativeId: string;
  address: string;
  district?: string;
  buildingType?: BuildingType;
  unitsCount?: number;
  residentsCount?: number;
  assignedStationId?: string | null;
}

export interface UnitInput {
  propertyId: string;
  unitNumber: string;
  residentsCount?: number;
  keysLimit?: number;
  notes?: string | null;
}

export interface StationInput {
  /** Immutable after creation - the update command has no `code`. */
  code: string;
  name: string;
  address?: string;
  district?: string;
  cooperativeId?: string | null;
  lat?: number | null;
  lng?: number | null;
  deploymentVariant: DeploymentVariant;
  accessMode: AccessMode;
  hasCamera: boolean;
  status?: StationStatus;
}

export interface ContainerInput {
  /** Immutable after creation, like the station code. */
  code: string;
  stationId: string;
  fraction: WasteFraction;
  capacityL?: number;
  dataSource: DataSource;
  sensorStatus?: string | null;
}

export interface CooperativesService {
  list(f?: CooperativeFilters): Promise<Cooperative[]>;
  get(id: string): Promise<Cooperative | undefined>;
  create(input: CooperativeInput): Promise<string>;
  update(id: string, input: CooperativeInput): Promise<void>;
}

export interface PropertiesService {
  list(f?: PropertyFilters): Promise<Property[]>;
  get(id: string): Promise<Property | undefined>;
  create(input: PropertyInput): Promise<string>;
  update(id: string, input: PropertyInput): Promise<void>;
}

export interface UnitsService {
  list(propertyId: string): Promise<Unit[]>;
  create(input: UnitInput): Promise<string>;
  issueKey(unitId: string): Promise<Unit>;
  revokeKey(unitId: string): Promise<Unit>;
}

export interface StationsService {
  list(f?: StationFilters): Promise<BinStation[]>;
  get(id: string): Promise<BinStation | undefined>;
  create(input: StationInput): Promise<string>;
  update(id: string, input: StationInput): Promise<void>;
}

export interface ContainersService {
  list(f?: ContainerFilters): Promise<Container[]>;
  get(id: string): Promise<Container | undefined>;
  history(id: string, days?: number): Promise<FillHistoryPoint[]>;
  create(input: ContainerInput): Promise<string>;
  update(id: string, input: ContainerInput): Promise<void>;
}
