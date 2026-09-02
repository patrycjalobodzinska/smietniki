"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  devicesService,
  type AssignDeviceInput,
  type DeviceFilters,
} from "@/lib/api/services/devices";

export function useDevices(f: DeviceFilters = {}) {
  return useQuery({ queryKey: qk.devices.list(f), queryFn: () => devicesService.list(f) });
}

/** Rename an OT device (PUT /v1/devices/{id}/name). */
export function useRenameDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => devicesService.rename(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.devices.all }),
  });
}

/**
 * Bind a device to an altanka/container. Sessions and measurements resolve
 * their station through this assignment, so both feeds are refreshed.
 */
export function useAssignDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignDeviceInput) => devicesService.assign(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.devices.all });
      qc.invalidateQueries({ queryKey: qk.sessions.all });
      qc.invalidateQueries({ queryKey: qk.fill.all });
    },
  });
}
