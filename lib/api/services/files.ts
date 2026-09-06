import { assetUrl, http } from "@/lib/api/client";
import type { StoredFile } from "@/lib/types";
import type { EnumItem } from "@/lib/api/services/users";

/**
 * File store (`/v1/files`) - uploads land in a container (Public/Private) and
 * are addressed by id. There is no browse endpoint: a file is reachable only
 * through whatever references it (e.g. an article's main photo).
 */

/** Same-origin URL for the binary; auth rides on the first-party cookie. */
export function fileBlobUrl(id: string): string {
  return assetUrl(`/v1/files/${id}/blob`);
}

export const filesService = {
  /**
   * NOTE: on the current backend deployment this endpoint answers 500 for any
   * upload (server-side storage error), so the UI surfaces the failure instead
   * of pretending the file landed.
   */
  async upload(file: File, container = "Public"): Promise<StoredFile> {
    const form = new FormData();
    form.append("File", file);
    const res = await http.postForm<StoredFile>("/v1/files", form, { FileContainer: container });
    return { id: res?.id ?? "", url: res?.url ?? "" };
  },

  get(id: string): Promise<StoredFile> {
    return http.get<StoredFile>(`/v1/files/${id}`);
  },

  remove(id: string): Promise<void> {
    return http.del<void>(`/v1/files/${id}`);
  },

  /** Available storage containers (Public/Private) for the upload picker. */
  async containers(): Promise<EnumItem[]> {
    const res = await http.get<{ containers: EnumItem[] }>("/v1/files/containers");
    return res?.containers ?? [];
  },
};
