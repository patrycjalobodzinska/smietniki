import { getPagedItems, http } from "@/lib/api/client";
import type { PlatformUser, PlatformUserState } from "@/lib/types";

/**
 * Platform user administration (`/v1/users`) and the signed-in account
 * (`/v1/account`, `/v1/users/{password,email,phone-number}`).
 *
 * This is the identity layer of the backend — separate from our domain roles in
 * config/roles.ts, which drive what the UI shows.
 */

/** `{ id, name, displayName }` triple the API uses for every enum. */
export interface EnumItem {
  id: number;
  name: string;
  displayName: string;
}

interface UserListDto {
  userId: string;
  email: string;
  roles?: EnumItem[];
  state: string;
  phoneNumberPrefix?: number | null;
  phoneNumber?: string | null;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  createdAt: string;
  lastChangePasswordDate?: string | null;
  registrationProvider?: string | null;
}

function mapUserRow(d: UserListDto): PlatformUser {
  return {
    id: d.userId,
    email: d.email,
    roles: (d.roles ?? []).map((r) => r.displayName || r.name),
    // The API returns lowercase state values ("active"/"locked").
    state: ((d.state ?? "").toLowerCase() === "locked" ? "locked" : "active") as PlatformUserState,
    phone: d.phoneNumber ?? null,
    phonePrefix: d.phoneNumberPrefix ?? null,
    emailConfirmed: !!d.emailConfirmed,
    phoneConfirmed: !!d.phoneNumberConfirmed,
    createdAt: d.createdAt,
    lastPasswordChangeAt: d.lastChangePasswordDate ?? null,
    registrationProvider: d.registrationProvider ?? null,
  };
}

export interface UserFilters {
  search?: string;
  /** API role name: None | Client | Admin. */
  role?: string;
  state?: PlatformUserState | "all";
}

export const usersService = {
  async list(f: UserFilters = {}): Promise<PlatformUser[]> {
    const dtos = await getPagedItems<UserListDto>("/v1/users", {
      Search: f.search,
      Role: f.role,
      State: f.state && f.state !== "all" ? (f.state === "locked" ? "Locked" : "Active") : undefined,
    });
    return dtos.map(mapUserRow).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async get(id: string): Promise<PlatformUser> {
    return mapUserRow(await http.get<UserListDto>(`/v1/users/${id}`));
  },

  /** Roles available on this deployment, for the filter/labels. */
  async roles(): Promise<EnumItem[]> {
    const res = await http.get<{ userRoles: EnumItem[] }>("/v1/users/roles");
    return res?.userRoles ?? [];
  },

  lock(id: string): Promise<void> {
    return http.put<void>(`/v1/users/${id}/lock`);
  },

  activate(id: string): Promise<void> {
    return http.put<void>(`/v1/users/${id}/active`);
  },
};

/* ---- The signed-in account --------------------------------------- */

interface AccountDto {
  userId: string;
  email: string;
  phoneNumberPrefix?: number | null;
  phoneNumber?: string | null;
  roles?: EnumItem[];
  state: string;
  createdAt: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  lastChangePasswordDate?: string | null;
}

export const accountService = {
  async get(): Promise<PlatformUser> {
    const d = await http.get<AccountDto>("/v1/account");
    return mapUserRow({ ...d, phoneNumberConfirmed: d.phoneNumberConfirmed, emailConfirmed: d.emailConfirmed });
  },

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    return http.put<void>("/v1/users/password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  },

  setEmail(email: string): Promise<void> {
    return http.put<void>("/v1/users/email", { email: email.trim() });
  },

  setPhoneNumber(prefix: number | null, phoneNumber: string): Promise<void> {
    return http.put<void>("/v1/users/phone-number", {
      phoneNumberPrefix: prefix,
      phoneNumber: phoneNumber.trim() || null,
    });
  },
};
