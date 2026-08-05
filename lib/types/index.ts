/* ------------------------------------------------------------------ */
/*  SMART WASTE — domain model                                         */
/*  Hierarchy: Cooperative → Property → Unit → AccessKey               */
/*             BinStation (altanka) → Container (pojemnik)             */
/*  Operations: AccessSession, Collection, Route, Vehicle             */
/*  The mock API and the future real API both conform to these shapes. */
/* ------------------------------------------------------------------ */

/** Deployment variant — the hybrid digitization model (spec §6.3). */
export type DeploymentVariant = "access" | "access_fill" | "access_fill_vision";

/** Where a data point came from (spec §6.4). */
export type DataSource = "auto" | "manual" | "estimated" | "none";

/** Waste fractions (spec §12.2). */
export type WasteFraction = "paper" | "plastic" | "glass" | "bio" | "mixed" | "other";

/** Access credential form. */
export type KeyType = "rfid" | "physical" | "mobile";

/* ---- Users / roles ---- */
/** Main built-out role is `city_admin`; others exist in the data model only. */
export type Role = "city_admin" | "system_admin" | "cooperative" | "operator" | "foreman";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  cooperativeId: string | null;
  avatarInitials: string;
}

/* ---- Estate infrastructure ---- */

export type EntityStatus = "active" | "inactive" | "warning";

export interface Cooperative {
  id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: EntityStatus;
  /** Dominant deployment variant across this cooperative's stations. */
  deploymentMix: DeploymentVariant;
  notes?: string;
  // Denormalized KPIs for list views
  propertyCount: number;
  unitCount: number;
  stationCount: number;
  activeKeys: number;
  avgFillLevel: number | null;
}

export type BuildingType = "block" | "tenement" | "single_family";

export interface Property {
  id: string;
  address: string;
  district: string;
  cooperativeId: string;
  buildingType: BuildingType;
  unitsCount: number;
  residentsCount: number;
  assignedStationId: string | null;
  activeKeys: number;
  status: EntityStatus;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  residentsCount: number;
  keysLimit: number;
  activeKeys: number;
  keyTypes: KeyType[];
  lastUsedAt: string | null;
  status: EntityStatus;
}

export interface AccessKey {
  id: string;
  unitId: string;
  keyType: KeyType;
  keyIdentifier: string;
  status: "active" | "revoked";
  issuedAt: string;
  revokedAt: string | null;
  notes?: string | null;
}

/* ---- Altanka (bin station) ---- */

export type StationStatus = "active" | "attention" | "inactive";
export type AccessMode = "rfid" | "physical" | "mobile" | "mixed";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BinStation {
  id: string;
  code: string;
  name: string;
  address: string;
  district: string;
  location: GeoPoint;
  cooperativeId: string;
  status: StationStatus;
  deploymentVariant: DeploymentVariant;
  accessMode: AccessMode;
  hasCamera: boolean;
  containerCount: number;
  /** null when the station has no fill sensors (Access-only). */
  avgFillLevel: number | null;
  fillDataSource: DataSource;
  lastCollectionAt: string | null;
  lastSessionAt: string | null;
}

/* ---- Container (pojemnik) ---- */

/** Six operational statuses (spec §12.4). */
export type FillStatus =
  | "empty" // 0–20
  | "normal" // 20–60
  | "rising" // 60–75
  | "high" // 75–90
  | "critical" // 90–100
  | "no_data";

export interface Container {
  id: string;
  code: string;
  stationId: string;
  cooperativeId: string;
  fraction: WasteFraction;
  capacityL: number;
  /** null when no fill measurement is available. */
  fillLevel: number | null;
  fillStatus: FillStatus;
  dataSource: DataSource;
  sensorOk: boolean;
  lastMeasurementAt: string | null;
  lastCollectionAt: string | null;
  predictedFullAt: string | null;
}

/* ---- Access sessions ---- */

export interface AccessSession {
  id: string;
  keyIdentifier: string;
  keyType: KeyType;
  unitId: string;
  unitNumber: string;
  stationId: string;
  stationName: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  hasRecording: boolean;
  anomaly: boolean;
}

/* ---- Devices (urządzenia OT) ---- */

export type DeviceSource = "camera" | "rfid" | "thermal" | "unknown";

export interface Device {
  id: string;
  deviceKey: string;
  source: DeviceSource;
  ip: string;
  channelId: number | null;
  name: string;
  stationCode: string | null;
  containerCode: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  eventCount: number;
  online: boolean;
}

/* ---- Collections (odbiory) ---- */

export type CollectionStatus = "confirmed" | "estimated" | "pending";

export interface Collection {
  id: string;
  stationId: string;
  stationName: string;
  containerId: string;
  fraction: WasteFraction;
  operator: string;
  vehicleId: string | null;
  routeId: string | null;
  collectedAt: string;
  levelBefore: number | null;
  levelAfter: number | null;
  levelBeforeSource: DataSource;
  estimatedVehicleLoadDelta: number;
  status: CollectionStatus;
  note?: string;
}

/* ---- Routes & vehicles ---- */

export type RouteStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface RouteStop {
  stationId: string;
  stationName: string;
  order: number;
  estimatedFillLevel: number;
  critical: boolean;
}

export interface CollectionRoute {
  id: string;
  name: string;
  date: string;
  operator: string;
  vehicleId: string | null;
  status: RouteStatus;
  stops: RouteStop[];
  estimatedDurationMin: number;
  estimatedVehicleFill: number;
  distanceKm: number;
}

export type VehicleStatus = "available" | "on_route" | "maintenance";

export interface Vehicle {
  id: string;
  code: string;
  operator: string;
  nominalCapacityKg: number;
  currentEstimatedFill: number;
  status: VehicleStatus;
}

/* ---- Analytics ---- */

export type InsightSeverity = "critical" | "warning" | "info" | "positive";

export interface Insight {
  id: string;
  title: string;
  description: string;
  metric: string;
  severity: InsightSeverity;
  /** Whether the insight is backed by real Fill telemetry or estimated. */
  reliability: "measured" | "estimated";
}

/* ------------------------------------------------------------------ */
/*  Shared semantics                                                   */
/* ------------------------------------------------------------------ */

export type FillTone = "low" | "mid" | "high" | "critical";

/** Color bucket for fill level (spec §21.4): <50 / 50–79 / 80–94 / 95+. */
export function fillTone(level: number): FillTone {
  if (level >= 95) return "critical";
  if (level >= 80) return "high";
  if (level >= 50) return "mid";
  return "low";
}

/** Operational fill status (spec §12.4) from a level, or no_data. */
export function fillStatus(level: number | null): FillStatus {
  if (level === null) return "no_data";
  if (level >= 90) return "critical";
  if (level >= 75) return "high";
  if (level >= 60) return "rising";
  if (level >= 20) return "normal";
  return "empty";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
