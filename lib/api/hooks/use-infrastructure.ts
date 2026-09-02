"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  cooperativesService,
  propertiesService,
  unitsService,
  stationsService,
  containersService,
  type CooperativeFilters,
  type PropertyFilters,
  type StationFilters,
  type ContainerFilters,
  type CooperativeInput,
  type PropertyInput,
  type UnitInput,
  type StationInput,
  type ContainerInput,
} from "@/lib/api/services/infrastructure";

export function useCooperatives(f: CooperativeFilters = {}) {
  return useQuery({ queryKey: qk.cooperatives.list(f), queryFn: () => cooperativesService.list(f) });
}
export function useCooperative(id: string) {
  return useQuery({ queryKey: qk.cooperatives.detail(id), queryFn: () => cooperativesService.get(id), enabled: !!id });
}

export function useProperties(f: PropertyFilters = {}) {
  return useQuery({ queryKey: qk.properties.list(f), queryFn: () => propertiesService.list(f) });
}
export function useProperty(id: string) {
  return useQuery({ queryKey: qk.properties.detail(id), queryFn: () => propertiesService.get(id), enabled: !!id });
}

export function useUnits(propertyId: string) {
  return useQuery({ queryKey: qk.units.list(propertyId), queryFn: () => unitsService.list(propertyId), enabled: !!propertyId });
}
export function useIssueKey(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => unitsService.issueKey(unitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.units.list(propertyId) }),
  });
}
export function useRevokeKey(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => unitsService.revokeKey(unitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.units.list(propertyId) }),
  });
}

export function useStations(f: StationFilters = {}) {
  return useQuery({ queryKey: qk.stations.list(f), queryFn: () => stationsService.list(f) });
}
export function useStation(id: string) {
  return useQuery({ queryKey: qk.stations.detail(id), queryFn: () => stationsService.get(id), enabled: !!id });
}

export function useContainers(f: ContainerFilters = {}) {
  return useQuery({ queryKey: qk.containers.list(f), queryFn: () => containersService.list(f) });
}
export function useContainer(id: string) {
  return useQuery({ queryKey: qk.containers.detail(id), queryFn: () => containersService.get(id), enabled: !!id });
}
export function useContainerHistory(id: string) {
  return useQuery({ queryKey: qk.containers.history(id), queryFn: () => containersService.history(id), enabled: !!id });
}

/* ------------------------------------------------------------------ */
/*  Mutations (create / update)                                        */
/* ------------------------------------------------------------------ */

/** Invalidate every list/detail touched by an infrastructure write. */
function useInfraMutation<TVars>(
  fn: (v: TVars) => Promise<unknown>,
  keys: ReadonlyArray<readonly unknown[]>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => keys.forEach((key) => qc.invalidateQueries({ queryKey: key })),
  });
}

export function useSaveCooperative() {
  return useInfraMutation(
    ({ id, input }: { id?: string; input: CooperativeInput }) =>
      id ? cooperativesService.update(id, input) : cooperativesService.create(input),
    [qk.cooperatives.all],
  );
}

export function useSaveProperty() {
  return useInfraMutation(
    ({ id, input }: { id?: string; input: PropertyInput }) =>
      id ? propertiesService.update(id, input) : propertiesService.create(input),
    [qk.properties.all, qk.cooperatives.all],
  );
}

export function useCreateUnit() {
  return useInfraMutation(
    (input: UnitInput) => unitsService.create(input),
    [qk.units.all, qk.properties.all, qk.accessKeys.all],
  );
}

export function useSaveStation() {
  return useInfraMutation(
    ({ id, input }: { id?: string; input: StationInput }) =>
      id ? stationsService.update(id, input) : stationsService.create(input),
    [qk.stations.all, qk.containers.all, qk.cooperatives.all],
  );
}

export function useSaveContainer() {
  return useInfraMutation(
    ({ id, input }: { id?: string; input: ContainerInput }) =>
      id ? containersService.update(id, input) : containersService.create(input),
    [qk.containers.all, qk.stations.all],
  );
}
