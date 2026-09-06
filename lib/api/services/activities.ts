import { getPagedItems, http } from "@/lib/api/client";
import type { UserActivity } from "@/lib/types";
import type { EnumItem } from "@/lib/api/services/users";

/**
 * Audit log (`/v1/userActivities`) - every sign-in, password change, lock and
 * domain event the backend records, with the originating IP / user agent.
 */

interface UserActivityDto {
  id: string;
  creatorId: string | null;
  userId: string | null;
  createdAt: string;
  type: EnumItem;
  name: string | null;
  message: string | null;
  userAgent?: { ipAddress?: string | null; userAgentData?: string | null } | null;
  mobileDeviceInfo?: { deviceName?: string | null; modelName?: string | null } | null;
}

function mapActivity(d: UserActivityDto): UserActivity {
  return {
    id: d.id,
    type: d.type?.name ?? "",
    typeLabel: d.type?.displayName || d.type?.name || "-",
    name: d.name ?? null,
    message: d.message ?? null,
    userId: d.userId ?? null,
    creatorId: d.creatorId ?? null,
    createdAt: d.createdAt,
    ipAddress: d.userAgent?.ipAddress ?? null,
    userAgent: d.userAgent?.userAgentData ?? null,
    deviceName: d.mobileDeviceInfo?.deviceName ?? d.mobileDeviceInfo?.modelName ?? null,
  };
}

export interface ActivityFilters {
  /** API enum name, e.g. `SignedIn`. */
  type?: string;
  userId?: string;
  creatorId?: string;
  /** Client-side text match over type/message/name. */
  search?: string;
}

export const activitiesService = {
  async list(f: ActivityFilters = {}): Promise<UserActivity[]> {
    const dtos = await getPagedItems<UserActivityDto>("/v1/userActivities", {
      Type: f.type,
      UserId: f.userId,
      CreatorId: f.creatorId,
    });
    let out = dtos.map(mapActivity).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (f.search) {
      const q = f.search.toLowerCase();
      out = out.filter(
        (a) =>
          a.typeLabel.toLowerCase().includes(q) ||
          (a.message ?? "").toLowerCase().includes(q) ||
          (a.name ?? "").toLowerCase().includes(q) ||
          (a.ipAddress ?? "").includes(q),
      );
    }
    return out;
  },

  get(id: string): Promise<UserActivity> {
    return http.get<UserActivityDto>(`/v1/userActivities/${id}`).then(mapActivity);
  },

  /** Activity types available on this deployment (long list - used as filter). */
  async types(): Promise<EnumItem[]> {
    const res = await http.get<{ userActivityTypes: EnumItem[] }>("/v1/userActivities/types");
    return res?.userActivityTypes ?? [];
  },
};
