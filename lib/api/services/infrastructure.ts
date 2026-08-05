/**
 * Infrastructure service facade (KM1 scope: bin stations + containers).
 * Backed entirely by the live SprigaAPI. Hooks/components import from here.
 */

export {
  stationsService,
  containersService,
} from "@/lib/api/services/infrastructure.real";

export type {
  StationFilters,
  ContainerFilters,
  FillHistoryPoint,
} from "@/lib/api/services/infrastructure.types";
