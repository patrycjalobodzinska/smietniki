import { getPagedItems, http } from "@/lib/api/client";
import { toKeyType, type AccessKeyDto, type UnitDto } from "@/lib/api/mappers";
import type { AccessKey, KeyType } from "@/lib/types";

/** Domain KeyType → API enum (PascalCase). Reverse of `toKeyType`. */
const KEY_TYPE_TO_API: Record<KeyType, string> = {
  rfid: "Rfid",
  mobile: "Mobile",
  physical: "Physical",
};

function mapKey(d: AccessKeyDto, units?: Map<string, string>): AccessKey {
  const unitId = d.unitId ?? "";
  return {
    id: d.id,
    unitId,
    unitNumber: units?.get(unitId) ?? null,
    keyType: toKeyType(d.keyType),
    keyIdentifier: d.keyIdentifier,
    status: d.status === "Active" ? "active" : "revoked",
    issuedAt: d.issuedAt,
    revokedAt: d.revokedAt ?? null,
    notes: d.notes ?? null,
  };
}

/**
 * All units keyed by id → unit number, so a key can show which lokal it belongs
 * to. The units layer is out of the KM1 nav but the endpoint still resolves the
 * label. Best-effort: if it fails (or PropertyId is required server-side) the
 * keys list still renders, just without lokal names.
 */
async function unitNumbersById(): Promise<Map<string, string>> {
  try {
    const units = await getPagedItems<UnitDto>("/v1/units");
    return new Map(units.map((u) => [u.id, u.unitNumber]));
  } catch {
    return new Map();
  }
}

export interface KeyFilters {
  search?: string;
  status?: "all" | "active" | "revoked";
  keyType?: KeyType | "all";
}

export interface IssueKeyInput {
  unitId: string;
  keyType: KeyType;
  keyIdentifier: string;
}

/** Option for the "issue key" unit picker. */
export interface UnitOption {
  id: string;
  label: string;
}

const includesCI = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase());

export const keysService = {
  async list(f: KeyFilters = {}): Promise<AccessKey[]> {
    const [dtos, units] = await Promise.all([
      getPagedItems<AccessKeyDto>("/v1/access-keys"),
      unitNumbersById(),
    ]);
    let out = dtos
      .map((d) => mapKey(d, units))
      .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
    if (f.status && f.status !== "all") out = out.filter((k) => k.status === f.status);
    if (f.keyType && f.keyType !== "all") out = out.filter((k) => k.keyType === f.keyType);
    if (f.search) out = out.filter((k) => includesCI(k.keyIdentifier, f.search!));
    return out;
  },

  /** Units available to assign a new key to (for the "Wydaj klucz" picker). */
  async units(): Promise<UnitOption[]> {
    const units = await getPagedItems<UnitDto>("/v1/units");
    return units
      .map((u) => ({ id: u.id, label: `Lokal ${u.unitNumber}` }))
      .sort((a, b) => a.label.localeCompare(b.label, "pl", { numeric: true }));
  },

  issue(input: IssueKeyInput): Promise<void> {
    return http.post<void>("/v1/access-keys", {
      unitId: input.unitId,
      keyType: KEY_TYPE_TO_API[input.keyType],
      keyIdentifier: input.keyIdentifier.trim(),
    });
  },

  revoke(id: string): Promise<void> {
    return http.put<void>(`/v1/access-keys/${id}/revoke`);
  },
};
