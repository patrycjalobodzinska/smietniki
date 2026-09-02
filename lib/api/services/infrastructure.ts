/**
 * Infrastructure service facade. Backed entirely by the live SprigaAPI; the
 * filter/type contract lives in infrastructure.types.ts so hooks and components
 * import from here unchanged.
 */

export {
  cooperativesService,
  propertiesService,
  unitsService,
  stationsService,
  containersService,
} from "@/lib/api/services/infrastructure.real";

export type {
  CooperativeFilters,
  PropertyFilters,
  StationFilters,
  ContainerFilters,
  FillHistoryPoint,
  CooperativeInput,
  PropertyInput,
  UnitInput,
  StationInput,
  ContainerInput,
} from "@/lib/api/services/infrastructure.types";
