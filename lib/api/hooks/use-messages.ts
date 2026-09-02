"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  emailsService,
  pushService,
  type EmailFilters,
  type PushFilters,
} from "@/lib/api/services/messages";

export function useEmails(f: EmailFilters = {}) {
  return useQuery({ queryKey: qk.emails.list(f), queryFn: () => emailsService.list(f) });
}

export function useEmail(id: string) {
  return useQuery({
    queryKey: qk.emails.detail(id),
    queryFn: () => emailsService.get(id),
    enabled: !!id,
  });
}

export function useEmailMeta() {
  return useQuery({ queryKey: qk.emails.meta, queryFn: () => emailsService.meta(), staleTime: 6e5 });
}

export function usePushMessages(f: PushFilters = {}) {
  return useQuery({ queryKey: qk.pushs.list(f), queryFn: () => pushService.list(f) });
}

export function usePushMeta() {
  return useQuery({ queryKey: qk.pushs.meta, queryFn: () => pushService.meta(), staleTime: 6e5 });
}

export function useMarkPushRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pushService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.pushs.all }),
  });
}

export function useRegisterPushDevice() {
  return useMutation({ mutationFn: (token: string) => pushService.registerDevice(token) });
}
