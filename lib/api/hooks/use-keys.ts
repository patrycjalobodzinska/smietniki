"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { keysService, type KeyFilters } from "@/lib/api/services/keys";

export function useAccessKeys(f: KeyFilters = {}) {
  return useQuery({ queryKey: qk.accessKeys.list(f), queryFn: () => keysService.list(f) });
}

export function useRevokeAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => keysService.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accessKeys.all }),
  });
}
