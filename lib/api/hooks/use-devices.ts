"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { devicesService, type DeviceFilters } from "@/lib/api/services/devices";

export function useDevices(f: DeviceFilters = {}) {
  return useQuery({ queryKey: qk.devices.list(f), queryFn: () => devicesService.list(f) });
}
