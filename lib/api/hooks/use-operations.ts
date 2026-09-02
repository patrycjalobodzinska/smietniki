"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  sessionsService,
  collectionsService,
  routesService,
  vehiclesService,
  type SessionFilters,
  type CollectionFilters,
  type RouteFilters,
  type RegisterCollectionInput,
  type RouteInput,
  type VehicleInput,
} from "@/lib/api/services/operations";

export function useSessions(f: SessionFilters = {}) {
  return useQuery({ queryKey: qk.sessions.list(f), queryFn: () => sessionsService.list(f) });
}
export function useAccessSession(id: string) {
  return useQuery({ queryKey: qk.sessionsDetail(id), queryFn: () => sessionsService.get(id), enabled: !!id });
}

export function useCollections(f: CollectionFilters = {}) {
  return useQuery({ queryKey: qk.collections.list(f), queryFn: () => collectionsService.list(f) });
}
export function useCollection(id: string) {
  return useQuery({ queryKey: qk.collectionsDetail(id), queryFn: () => collectionsService.get(id), enabled: !!id });
}

export function useRoutes(f: RouteFilters = {}) {
  return useQuery({ queryKey: qk.routes.list(f), queryFn: () => routesService.list(f) });
}
export function useRoute(id: string) {
  return useQuery({ queryKey: qk.routes.detail(id), queryFn: () => routesService.get(id), enabled: !!id });
}

export function useOptimizeRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stationIds: string[]) => routesService.optimize(stationIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.routes.all }),
  });
}

export function useVehicles() {
  return useQuery({ queryKey: qk.vehicles.list(), queryFn: () => vehiclesService.list() });
}

/** POST /v1/collections — registering a pickup changes fill levels too. */
export function useRegisterCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterCollectionInput) => collectionsService.register(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.collections.all });
      qc.invalidateQueries({ queryKey: qk.containers.all });
      qc.invalidateQueries({ queryKey: qk.stations.all });
    },
  });
}

export function usePlanRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RouteInput) => routesService.plan(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.routes.all }),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => vehiclesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.vehicles.list() }),
  });
}
