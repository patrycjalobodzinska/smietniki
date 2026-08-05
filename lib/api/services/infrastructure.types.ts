import type {
  BinStation,
  Container,
  DataSource,
  DeploymentVariant,
  FillStatus,
  WasteFraction,
} from "@/lib/types";

/**
 * Shared filter shapes + the infrastructure service contract (KM1 scope:
 * bin stations + containers).
 */

export interface StationFilters {
  search?: string;
  district?: string;
  variant?: DeploymentVariant | "all";
  status?: BinStation["status"] | "all";
  hasCamera?: boolean;
}

export interface ContainerFilters {
  search?: string;
  stationId?: string;
  fraction?: WasteFraction | "all";
  status?: FillStatus | "all";
  dataSource?: DataSource | "all";
}

export interface FillHistoryPoint {
  label: string;
  value: number;
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
