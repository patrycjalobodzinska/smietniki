"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { dashboardService } from "@/lib/api/services/dashboard";

/** Live platform summary (GET /v1/dashboard/summary). */
export function useDashboardSummary() {
  return useQuery({ queryKey: qk.dashboard.summary, queryFn: () => dashboardService.summary() });
}
