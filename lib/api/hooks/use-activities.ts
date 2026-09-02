"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { activitiesService, type ActivityFilters } from "@/lib/api/services/activities";

export function useUserActivities(f: ActivityFilters = {}) {
  return useQuery({ queryKey: qk.activities.list(f), queryFn: () => activitiesService.list(f) });
}

export function useActivityTypes() {
  return useQuery({
    queryKey: qk.activities.types,
    queryFn: () => activitiesService.types(),
    staleTime: 6e5,
  });
}
