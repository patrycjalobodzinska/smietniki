"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  stationsService,
  containersService,
  type StationFilters,
  type ContainerFilters,
} from "@/lib/api/services/infrastructure";

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
