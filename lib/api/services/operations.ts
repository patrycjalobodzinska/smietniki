/**
 * Operations service facade (sessions, collections, routes, vehicles).
 * Backed entirely by the live SprigaAPI. Hooks/components import from here.
 */

export {
  sessionsService,
  collectionsService,
  routesService,
  vehiclesService,
} from "@/lib/api/services/operations.real";

export type {
  SessionFilters,
  CollectionFilters,
  RouteFilters,
  RegisterCollectionInput,
  RouteInput,
  VehicleInput,
} from "@/lib/api/services/operations.types";
