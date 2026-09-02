"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { eventsService, type RawEventFilters } from "@/lib/api/services/events";

export function useRawEvents(f: RawEventFilters = {}) {
  return useQuery({ queryKey: qk.events.list(f), queryFn: () => eventsService.list(f) });
}

export function useRawEvent(id: string) {
  return useQuery({
    queryKey: qk.events.list({ id }),
    queryFn: () => eventsService.get(id),
    enabled: !!id,
  });
}

/** Latest camera snapshots, optionally narrowed to one device IP. */
export function useSnapshots(limit = 4, deviceIp?: string, enabled = true) {
  return useQuery({
    queryKey: qk.events.list({ snapshots: limit, deviceIp }),
    queryFn: () => eventsService.snapshots(limit, deviceIp),
    enabled,
  });
}
