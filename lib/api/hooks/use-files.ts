"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { filesService } from "@/lib/api/services/files";

export function useFileContainers() {
  return useQuery({
    queryKey: qk.files.containers,
    queryFn: () => filesService.containers(),
    staleTime: 6e5,
  });
}

export function useFileInfo(id: string) {
  return useQuery({
    queryKey: qk.files.detail(id),
    queryFn: () => filesService.get(id),
    enabled: !!id,
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, container }: { file: File; container: string }) =>
      filesService.upload(file, container),
  });
}

export function useDeleteFile() {
  return useMutation({ mutationFn: (id: string) => filesService.remove(id) });
}
