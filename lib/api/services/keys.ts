import { getPagedItems, http } from "@/lib/api/client";
import { toKeyType, type AccessKeyDto } from "@/lib/api/mappers";
import type { AccessKey, KeyType } from "@/lib/types";

function mapKey(d: AccessKeyDto): AccessKey {
  return {
    id: d.id,
    unitId: d.unitId ?? "",
    keyType: toKeyType(d.keyType),
    keyIdentifier: d.keyIdentifier,
    status: d.status === "Active" ? "active" : "revoked",
    issuedAt: d.issuedAt,
    revokedAt: d.revokedAt ?? null,
    notes: d.notes ?? null,
  };
}

export interface KeyFilters {
  search?: string;
  status?: "all" | "active" | "revoked";
  keyType?: KeyType | "all";
}

const includesCI = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase());

export const keysService = {
  async list(f: KeyFilters = {}): Promise<AccessKey[]> {
    const dtos = await getPagedItems<AccessKeyDto>("/v1/access-keys");
    let out = dtos.map(mapKey).sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
    if (f.status && f.status !== "all") out = out.filter((k) => k.status === f.status);
    if (f.keyType && f.keyType !== "all") out = out.filter((k) => k.keyType === f.keyType);
    if (f.search) out = out.filter((k) => includesCI(k.keyIdentifier, f.search!));
    return out;
  },

  revoke(id: string): Promise<void> {
    return http.put<void>(`/v1/access-keys/${id}/revoke`);
  },
};
