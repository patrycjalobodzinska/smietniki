import type {
  DeploymentVariant,
  DataSource,
  WasteFraction,
  FillStatus,
  KeyType,
  RouteStatus,
  CollectionStatus,
  StationStatus,
  VehicleStatus,
  BuildingType,
} from "@/lib/types";

/** Central Polish label maps - reused across tables, filters, badges, charts. */

export const FRACTION_LABEL: Record<WasteFraction, string> = {
  paper: "Papier",
  plastic: "Tworzywa",
  glass: "Szkło",
  bio: "Bio",
  mixed: "Zmieszane",
  other: "Inne",
};

export const VARIANT_LABEL: Record<DeploymentVariant, string> = {
  access: "Kontrola dostępu",
  access_fill: "Dostęp + zapełnienie",
  access_fill_vision: "Dostęp + zapełnienie + monitoring",
};

export const VARIANT_SHORT: Record<DeploymentVariant, string> = {
  access: "Dostęp",
  access_fill: "Zapełnienie",
  access_fill_vision: "Monitoring",
};

export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  auto: "Automatyczne",
  manual: "Manualne",
  estimated: "Estymowane",
  none: "Brak danych",
};

export const FILL_STATUS_LABEL: Record<FillStatus, string> = {
  empty: "Pusty",
  normal: "Normalny",
  rising: "Rosnące",
  high: "Wysokie",
  critical: "Krytyczne",
  no_data: "Brak danych",
};

export const KEY_TYPE_LABEL: Record<KeyType, string> = {
  rfid: "RFID",
  physical: "Fizyczny",
  mobile: "Mobilny",
};

export const ROUTE_STATUS_LABEL: Record<RouteStatus, string> = {
  planned: "Zaplanowana",
  in_progress: "W toku",
  completed: "Zakończona",
  cancelled: "Anulowana",
};

export const COLLECTION_STATUS_LABEL: Record<CollectionStatus, string> = {
  confirmed: "Potwierdzony",
  estimated: "Estymowany",
  pending: "Oczekuje",
};

export const STATION_STATUS_LABEL: Record<StationStatus, string> = {
  active: "Aktywna",
  attention: "Uwaga",
  inactive: "Nieaktywna",
};

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  available: "Dostępny",
  on_route: "Na trasie",
  maintenance: "Serwis",
};

export const BUILDING_LABEL: Record<BuildingType, string> = {
  block: "Blok",
  tenement: "Kamienica",
  single_family: "Dom jednorodzinny",
};

/**
 * Typy zdarzeń ingestu. API zwraca tu surowy identyfikator z urządzenia, więc
 * tłumaczymy tylko znane wartości - nieznane pokazujemy bez zmian, żeby
 * diagnostyka nie gubiła informacji.
 *
 * `AIOP_Video` to nazwa części multipartu w pushu ISAPI: JSON z analizy obrazu
 * kamery (Hikvision AI Open Platform) wysyłany razem z klatką JPEG.
 */
const EVENT_TYPE_LABEL: Record<string, string> = {
  AIOP_Video: "Analiza obrazu z kamery",
};

export function eventTypeLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return EVENT_TYPE_LABEL[value] ?? value;
}
