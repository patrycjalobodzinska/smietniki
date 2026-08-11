"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { keysService, type IssueKeyInput, type KeyFilters } from "@/lib/api/services/keys";

export function useAccessKeys(f: KeyFilters = {}) {
  return useQuery({ queryKey: qk.accessKeys.list(f), queryFn: () => keysService.list(f) });
}

/** Units for the "Wydaj klucz" picker. Loaded lazily (only when the form opens). */
export function useKeyUnits(enabled: boolean) {
  return useQuery({
    queryKey: qk.accessKeys.units,
    queryFn: () => keysService.units(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useIssueAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IssueKeyInput) => keysService.issue(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accessKeys.all }),
  });
}

export function useRevokeAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => keysService.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accessKeys.all }),
  });
}
