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
