/**
 * SprigaAPI DTO → domain model mappers.
 *
 * The API uses PascalCase enums and a slightly different field set than our
 * `lib/types` domain model (which is snake_case and carries a few denormalized
 * KPI fields). All translation lives here so the service layer stays readable
 * and the rest of the app never sees an API-shaped object.
 */

import {
  fillStatus as fillStatusFromLevel,
  type AccessMode,
  type AccessSession,
  type BinStation,
  type BuildingType,
  type Collection,
  type CollectionRoute,
  type CollectionStatus,
  type Container,
  type Cooperative,
  type DataSource,
  type DeploymentVariant,
  type EntityStatus,
  type KeyType,
  type Property,
  type Role,
  type RouteStatus,
  type StationStatus,
  type Unit,
  type User,
  type Vehicle,
  type VehicleStatus,
  type WasteFraction,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Enum translation                                                   */
/* ------------------------------------------------------------------ */

const lookup =
  <T>(map: Record<string, T>, fallback: T) =>
  (value: string | null | undefined): T =>
    (value != null && map[value]) || fallback;

export const toDeploymentVariant = lookup<DeploymentVariant>(
  { Access: "access", AccessFill: "access_fill", AccessFillVision: "access_fill_vision" },
  "access",
);

export const toDataSource = lookup<DataSource>(
  { Auto: "auto", Manual: "manual", Estimated: "estimated", NoData: "none" },
  "none",
);

/** API knows 5 fractions (no "other"); we keep "other" only for local data. */
export const toFraction = lookup<WasteFraction>(
  { Mixed: "mixed", Paper: "paper", Plastic: "plastic", Glass: "glass", Bio: "bio" },
  "mixed",
);

export const toKeyType = lookup<KeyType>(
  { Rfid: "rfid", Mobile: "mobile", Physical: "physical" },
  "rfid",
);

export const toAccessMode = lookup<AccessMode>(
  { Rfid: "rfid", PhysicalKey: "physical", MobileKey: "mobile", Mixed: "mixed" },
  "rfid",
);

const toEntityStatus = lookup<EntityStatus>(
  { Active: "active", Inactive: "inactive", Vacant: "inactive" },
  "active",
);

const toStationStatus = lookup<StationStatus>(
  { Active: "active", Inactive: "inactive", Maintenance: "attention" },
  "active",
);

/* ---- Reverse maps (domain → API enum), for write commands ---------- */

export const DEPLOYMENT_TO_API: Record<DeploymentVariant, string> = {
  access: "Access",
  access_fill: "AccessFill",
  access_fill_vision: "AccessFillVision",
};

export const DATA_SOURCE_TO_API: Record<DataSource, string> = {
  auto: "Auto",
  manual: "Manual",
  estimated: "Estimated",
  none: "NoData",
};

/** The API has 5 fractions - our local-only "other" is sent as Mixed. */
export const FRACTION_TO_API: Record<WasteFraction, string> = {
  mixed: "Mixed",
  paper: "Paper",
  plastic: "Plastic",
  glass: "Glass",
  bio: "Bio",
  other: "Mixed",
};

export const ACCESS_MODE_TO_API: Record<AccessMode, string> = {
  rfid: "Rfid",
  physical: "PhysicalKey",
  mobile: "MobileKey",
  mixed: "Mixed",
};

export const STATION_STATUS_TO_API: Record<StationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  attention: "Maintenance",
};

function toBuildingType(v: string | null | undefined): BuildingType {
  const s = (v ?? "").toLowerCase();
  if (s.includes("kamienic")) return "tenement";
  if (s.includes("jednorodzin")) return "single_family";
  return "block";
}

/* ------------------------------------------------------------------ */
/*  Raw DTO shapes (only the fields we read)                           */
/* ------------------------------------------------------------------ */

export interface CooperativeDto {
  id: string;
  name: string;
  district: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
}

export interface PropertyDto {
  id: string;
  cooperativeId: string;
  address: string;
  district: string;
  buildingType: string;
  unitsCount: number;
  residentsCount: number;
  assignedBinStationId: string | null;
  status: string;
}

export interface UnitDto {
  id: string;
  propertyId: string;
  unitNumber: string;
  residentsCount: number;
  keysLimit: number;
  status: string;
  notes: string | null;
}

export interface AccessKeyDto {
  id: string;
  unitId: string;
  keyType: string;
  keyIdentifier: string;
  status: string;
  issuedAt: string;
  revokedAt: string | null;
  notes: string | null;
}

export interface BinStationDto {
  id: string;
  code: string;
  name: string;
  address?: string;
  district: string;
  /** Present only on the detail endpoint; the list omits it. */
  cooperativeId?: string;
  latitude: number | null;
  longitude: number | null;
  deploymentVariant: string;
  accessMode: string;
  hasCamera: boolean;
  status: string;
  containersCount?: number;
  containers?: ContainerDto[];
}

export interface ContainerDto {
  id: string;
  code: string;
  binStationId: string;
  fractionType: string;
  capacity: number;
  fillLevel: number | null;
  dataSource: string;
  sensorStatus: string | null;
  status: string;
  lastMeasurementAt: string | null;
}

export interface UserDto {
  userId: string;
  email: string;
  roles?: { id: number; name: string; displayName: string }[];
  state?: string;
}

/* ------------------------------------------------------------------ */
/*  Object mappers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Aggregates the API doesn't return per-cooperative. The real service fills
 * these by scanning properties/stations/containers client-side (Phase 0).
 */
export interface CooperativeKpis {
  propertyCount: number;
  unitCount: number;
  stationCount: number;
  activeKeys: number;
  avgFillLevel: number | null;
  deploymentMix: DeploymentVariant;
}

export function mapCooperative(dto: CooperativeDto, kpis?: Partial<CooperativeKpis>): Cooperative {
  return {
    id: dto.id,
    name: dto.name,
    district: dto.district,
    address: "",
    contactPerson: dto.contactPerson,
    email: dto.email,
    phone: dto.phone,
    status: toEntityStatus(dto.status),
    deploymentMix: kpis?.deploymentMix ?? "access",
    propertyCount: kpis?.propertyCount ?? 0,
    unitCount: kpis?.unitCount ?? 0,
    stationCount: kpis?.stationCount ?? 0,
    activeKeys: kpis?.activeKeys ?? 0,
    avgFillLevel: kpis?.avgFillLevel ?? null,
  };
}

export function mapProperty(dto: PropertyDto, activeKeys = 0): Property {
  return {
    id: dto.id,
    address: dto.address,
    district: dto.district,
    cooperativeId: dto.cooperativeId,
    buildingType: toBuildingType(dto.buildingType),
    unitsCount: dto.unitsCount,
    residentsCount: dto.residentsCount,
    assignedStationId: dto.assignedBinStationId ?? null,
    activeKeys,
    status: toEntityStatus(dto.status),
  };
}

export function mapUnit(dto: UnitDto, keys: AccessKeyDto[] = []): Unit {
  const active = keys.filter((k) => k.status === "Active");
  return {
    id: dto.id,
    propertyId: dto.propertyId,
    unitNumber: dto.unitNumber,
    residentsCount: dto.residentsCount,
    keysLimit: dto.keysLimit,
    activeKeys: active.length,
    keyTypes: [...new Set(active.map((k) => toKeyType(k.keyType)))],
    lastUsedAt: null,
    status: toEntityStatus(dto.status),
  };
}

/** Fill aggregates for a station, derived from its containers. */
function stationFill(containers: ContainerDto[]): {
  avgFillLevel: number | null;
  fillDataSource: DataSource;
} {
  const measured = containers.filter((c) => typeof c.fillLevel === "number");
  const avgFillLevel = measured.length
    ? Math.round(measured.reduce((s, c) => s + (c.fillLevel as number), 0) / measured.length)
    : null;
  const hasAuto = containers.some((c) => c.dataSource === "Auto");
  const hasManual = containers.some((c) => c.dataSource === "Manual");
  const fillDataSource: DataSource = hasAuto ? "auto" : hasManual ? "manual" : "none";
  return { avgFillLevel, fillDataSource };
}

// The bin-stations LIST omits cooperativeId (only the detail carries it), so
// callers resolve it via property.assignedBinStationId and pass it in here.
export function mapStation(
  dto: BinStationDto,
  containers: ContainerDto[] = [],
  cooperativeId?: string,
): BinStation {
  const { avgFillLevel, fillDataSource } = stationFill(containers);
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    address: dto.address ?? "",
    district: dto.district,
    // API dopuszcza altanke bez pozycji - wtedy nie ma czego pokazac na mapie.
    location:
      typeof dto.latitude === "number" && typeof dto.longitude === "number"
        ? { lat: dto.latitude, lng: dto.longitude }
        : null,
    cooperativeId: cooperativeId ?? dto.cooperativeId ?? "",
    status: toStationStatus(dto.status),
    deploymentVariant: toDeploymentVariant(dto.deploymentVariant),
    accessMode: toAccessMode(dto.accessMode),
    hasCamera: dto.hasCamera,
    containerCount: dto.containersCount ?? containers.length,
    avgFillLevel,
    fillDataSource,
    lastCollectionAt: null,
    lastSessionAt: null,
  };
}

export function mapContainer(dto: ContainerDto, cooperativeId = ""): Container {
  const dataSource = toDataSource(dto.dataSource);
  return {
    id: dto.id,
    code: dto.code,
    stationId: dto.binStationId,
    cooperativeId,
    fraction: toFraction(dto.fractionType),
    capacityL: dto.capacity,
    fillLevel: dto.fillLevel ?? null,
    fillStatus: dataSource === "none" ? "no_data" : fillStatusFromLevel(dto.fillLevel ?? null),
    dataSource,
    sensorOk: dto.status !== "OutOfService" && dto.sensorStatus !== "Error",
    lastMeasurementAt: dto.lastMeasurementAt ?? null,
    lastCollectionAt: null,
    predictedFullAt: null,
  };
}

/** Map API roles → our app Role. The built-out UX role is `city_admin`. */
function toRole(dto: UserDto): Role {
  const names = (dto.roles ?? []).map((r) => r.name);
  if (names.includes("Admin")) return "city_admin";
  if (names.includes("Client")) return "operator";
  return "city_admin";
}

export function mapUser(dto: UserDto): User {
  const local = dto.email.split("@")[0] ?? dto.email;
  const initials = local.slice(0, 2).toUpperCase();
  return {
    id: dto.userId,
    name: dto.email,
    email: dto.email,
    role: toRole(dto),
    organization: "SprigaAPI",
    cooperativeId: null,
    avatarInitials: initials,
  };
}

/* ------------------------------------------------------------------ */
/*  Operations (sessions, collections, routes, vehicles)               */
/* ------------------------------------------------------------------ */

const toRouteStatus = lookup<RouteStatus>(
  { Planned: "planned", InProgress: "in_progress", Completed: "completed", Cancelled: "cancelled" },
  "planned",
);

const toVehicleStatus = lookup<VehicleStatus>(
  { Active: "available", InService: "on_route", Retired: "maintenance" },
  "available",
);

/** Minimal station/container lookups the operations DTOs reference by code. */
export interface StationRef {
  id: string;
  name: string;
}
export interface ContainerRef {
  id: string;
  fraction: WasteFraction;
}

export interface AccessSessionDto {
  id: string;
  deviceKey: string | null;
  binStationCode: string | null;
  cardIdentifier: string | null;
  accessKeyId: string | null;
  unitId: string | null;
  anomalyFlag: boolean;
  occurredAt: string;
  rawEventId: string | null;
}

export interface CollectionDto {
  id: string;
  binStationCode: string | null;
  containerCode: string | null;
  operatorName: string | null;
  vehicleId: string | null;
  routeId: string | null;
  collectedAt: string;
  levelBefore: number | null;
  levelAfter: number | null;
  note: string | null;
}

export interface RouteDto {
  id: string;
  date: string;
  operatorName: string | null;
  vehicleId: string | null;
  status: string;
}

export interface VehicleDto {
  id: string;
  code: string;
  operatorName: string | null;
  nominalCapacityUnits: number | null;
  status: string;
}

// The API models a session as a single access event (occurredAt, RFID card) -
// there's no end time/duration, key type or recording flag, so those default.
export function mapSession(dto: AccessSessionDto, stations: Map<string, StationRef>): AccessSession {
  const st = dto.binStationCode ? stations.get(dto.binStationCode) : undefined;
  return {
    id: dto.id,
    keyIdentifier: dto.cardIdentifier ?? "-",
    keyType: "rfid",
    unitId: dto.unitId ?? "",
    unitNumber: "",
    accessKeyId: dto.accessKeyId ?? null,
    stationId: st?.id ?? "",
    // The station link travels via deviceKey (devices module, out of scope);
    // fall back to the code, then the device key, so the row is never blank.
    stationName: st?.name ?? dto.binStationCode ?? dto.deviceKey ?? "-",
    startedAt: dto.occurredAt,
    endedAt: null,
    durationSeconds: null,
    hasRecording: false,
    anomaly: !!dto.anomalyFlag,
    rawEventId: dto.rawEventId ?? null,
  };
}

export function mapCollection(
  dto: CollectionDto,
  stations: Map<string, StationRef>,
  containers: Map<string, ContainerRef>,
): Collection {
  const st = dto.binStationCode ? stations.get(dto.binStationCode) : undefined;
  const ct = dto.containerCode ? containers.get(dto.containerCode) : undefined;
  const hasLevels = dto.levelBefore != null && dto.levelAfter != null;
  const status: CollectionStatus = hasLevels ? "confirmed" : "estimated";
  return {
    id: dto.id,
    stationId: st?.id ?? "",
    stationName: st?.name ?? dto.binStationCode ?? "-",
    containerId: ct?.id ?? "",
    fraction: ct?.fraction ?? "mixed",
    operator: dto.operatorName ?? "-",
    vehicleId: dto.vehicleId ?? null,
    routeId: dto.routeId ?? null,
    collectedAt: dto.collectedAt,
    levelBefore: dto.levelBefore ?? null,
    levelAfter: dto.levelAfter ?? null,
    levelBeforeSource: "manual",
    estimatedVehicleLoadDelta: hasLevels ? Math.max(0, (dto.levelBefore as number) - (dto.levelAfter as number)) : 0,
    status,
    note: dto.note ?? undefined,
  };
}

// The API's route is a header only (date/operator/vehicle/status) - no stops,
// distances or estimates, and there is no per-route detail endpoint. Those
// fields default to empty so the UI renders without them.
export function mapRoute(dto: RouteDto): CollectionRoute {
  const day = (dto.date ?? "").slice(0, 10);
  return {
    id: dto.id,
    name: day ? `Trasa ${day}` : "Trasa",
    date: dto.date,
    operator: dto.operatorName ?? "-",
    vehicleId: dto.vehicleId ?? null,
    status: toRouteStatus(dto.status),
    stops: [],
    estimatedDurationMin: 0,
    estimatedVehicleFill: 0,
    distanceKm: 0,
  };
}

export function mapVehicle(dto: VehicleDto): Vehicle {
  return {
    id: dto.id,
    code: dto.code,
    operator: dto.operatorName ?? "-",
    nominalCapacityKg: dto.nominalCapacityUnits ?? 0,
    currentEstimatedFill: 0,
    status: toVehicleStatus(dto.status),
  };
}
