import { http } from "@/lib/api/client";
import { mapUser, type UserDto } from "@/lib/api/mappers";
import type { User } from "@/lib/types";

/**
 * Authentication against SprigaAPI. Auth is a httpOnly cookie set by sign-in
 * (see lib/api/client.ts) — there is no token to handle here. `credentials:
 * "include"` on the client sends the cookie on every subsequent request.
 */
export const authService = {
  signIn(email: string, password: string): Promise<User> {
    return http.post<UserDto>("/v1/account/sign-in", { email, password }).then(mapUser);
  },

  signOut(): Promise<void> {
    return http.del<void>("/v1/account/sign-out");
  },

  /** Current signed-in user; rejects with ApiError 401 when not authenticated. */
  me(): Promise<User> {
    return http.get<UserDto>("/v1/users/user").then(mapUser);
  },
};
