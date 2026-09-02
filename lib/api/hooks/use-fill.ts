"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  fillService,
  type FillMeasurementFilters,
  type ManualMeasurementInput,
} from "@/lib/api/services/fill";

export function useFillMeasurements(f: FillMeasurementFilters = {}, enabled = true) {
  return useQuery({
    queryKey: qk.fill.measurements(f),
    queryFn: () => fillService.measurements(f),
    enabled,
  });
}

/** Manual fill entry — also refreshes containers/stations, whose level changes. */
export function useAddManualMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualMeasurementInput) => fillService.addManual(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.fill.all });
      qc.invalidateQueries({ queryKey: qk.containers.all });
      qc.invalidateQueries({ queryKey: qk.stations.all });
      qc.invalidateQueries({ queryKey: qk.dashboard.summary });
    },
  });
}
