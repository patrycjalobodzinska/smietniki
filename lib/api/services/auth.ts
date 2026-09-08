import { http } from "@/lib/api/client";
import { mapUser, type UserDto } from "@/lib/api/mappers";
import type { User } from "@/lib/types";

/**
 * Authentication against SprigaAPI. Auth is a httpOnly cookie set by sign-in
 * (see lib/api/client.ts) - there is no token to handle here. `credentials:
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

  /** Extends the auth cookie without re-entering credentials. */
  refresh(): Promise<User> {
    return http.post<UserDto>("/v1/account/refresh-cookie/web").then(mapUser);
  },

  /* ---- Odzyskiwanie hasła i potwierdzenie adresu ------------------- */

  /** Step 1 of a password reset: emails a reset token to the address. */
  requestPasswordReset(email: string): Promise<void> {
    return http.post<void>("/v1/account/request-password-reset", { email: email.trim() });
  },

  /** Step 2: sets a new password using the token from the email. */
  resetPassword(input: {
    userId: string;
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    return http.post<void>("/v1/account/reset-password", {
      userId: input.userId.trim(),
      token: input.token.trim(),
      password: input.password,
      confirmPassword: input.confirmPassword,
    });
  },

  /** (Re)sends the address-confirmation email for a user. */
  sendConfirmationEmail(userId: string): Promise<void> {
    return http.post<void>("/v1/account/confirmation-email", { userId });
  },

  /** Confirms an email address with the token from the message. */
  confirmEmail(userId: string, token: string): Promise<void> {
    return http.post<void>("/v1/account/confirm-email", { userId: userId.trim(), token: token.trim() });
  },
};
