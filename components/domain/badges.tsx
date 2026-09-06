import { Camera, Gauge, KeyRound, AlertTriangle } from "lucide-react";
import type {
  DeploymentVariant,
  DataSource,
  WasteFraction,
  FillStatus,
  RouteStatus,
  CollectionStatus,
  StationStatus,
  VehicleStatus,
  Role,
} from "@/lib/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  FRACTION_LABEL,
  VARIANT_SHORT,
  DATA_SOURCE_LABEL,
  FILL_STATUS_LABEL,
  ROUTE_STATUS_LABEL,
  COLLECTION_STATUS_LABEL,
  STATION_STATUS_LABEL,
  VEHICLE_STATUS_LABEL,
} from "@/lib/labels";
import { ROLES } from "@/config/roles";

type V = BadgeProps["variant"];

/** Deployment variant chip (Access / Fill / Vision) - visible everywhere per spec. */
export function VariantBadge({ variant }: { variant: DeploymentVariant }) {
  const map: Record<DeploymentVariant, { v: V; icon: typeof KeyRound }> = {
    access: { v: "muted", icon: KeyRound },
    access_fill: { v: "success", icon: Gauge },
    access_fill_vision: { v: "info", icon: Camera },
  };
  const { v, icon: Icon } = map[variant];
  return (
    <Badge variant={v}>
      <Icon className="size-3" />
      {VARIANT_SHORT[variant]}
    </Badge>
  );
}

const SOURCE_TONE: Record<DataSource, V> = {
  auto: "success",
  manual: "info",
  estimated: "warning",
  none: "muted",
};
export function DataSourceBadge({ source }: { source: DataSource }) {
  return <Badge variant={SOURCE_TONE[source]}>{DATA_SOURCE_LABEL[source]}</Badge>;
}

export function FractionBadge({ fraction }: { fraction: WasteFraction }) {
  return <Badge variant="outline">{FRACTION_LABEL[fraction]}</Badge>;
}

const FILL_TONE: Record<FillStatus, V> = {
  empty: "muted",
  normal: "success",
  rising: "warning",
  high: "warning",
  critical: "danger",
  no_data: "muted",
};
export function FillStatusBadge({ status }: { status: FillStatus }) {
  return <Badge variant={FILL_TONE[status]} dot>{FILL_STATUS_LABEL[status]}</Badge>;
}

const ROUTE_TONE: Record<RouteStatus, V> = {
  planned: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "muted",
};
export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  return <Badge variant={ROUTE_TONE[status]} dot>{ROUTE_STATUS_LABEL[status]}</Badge>;
}

const COLLECTION_TONE: Record<CollectionStatus, V> = {
  confirmed: "success",
  estimated: "warning",
  pending: "muted",
};
export function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  return <Badge variant={COLLECTION_TONE[status]} dot>{COLLECTION_STATUS_LABEL[status]}</Badge>;
}

const STATION_TONE: Record<StationStatus, V> = {
  active: "success",
  attention: "warning",
  inactive: "muted",
};
export function StationStatusBadge({ status }: { status: StationStatus }) {
  return <Badge variant={STATION_TONE[status]} dot>{STATION_STATUS_LABEL[status]}</Badge>;
}

const VEHICLE_TONE: Record<VehicleStatus, V> = {
  available: "success",
  on_route: "warning",
  maintenance: "danger",
};
export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <Badge variant={VEHICLE_TONE[status]} dot>{VEHICLE_STATUS_LABEL[status]}</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
  const r = ROLES[role];
  return <Badge variant={r.tone === "muted" ? "muted" : r.tone}>{r.label}</Badge>;
}

export function AnomalyBadge() {
  return (
    <Badge variant="danger">
      <AlertTriangle className="size-3" />
      Anomalia
    </Badge>
  );
}
