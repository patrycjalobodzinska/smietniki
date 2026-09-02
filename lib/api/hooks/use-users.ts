"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { accountService, usersService, type UserFilters } from "@/lib/api/services/users";
import { authService } from "@/lib/api/services/auth";

export function usePlatformUsers(f: UserFilters = {}) {
  return useQuery({ queryKey: qk.users.list(f), queryFn: () => usersService.list(f) });
}

export function usePlatformUser(id: string) {
  return useQuery({
    queryKey: qk.users.detail(id),
    queryFn: () => usersService.get(id),
    enabled: !!id,
  });
}

export function useUserRoles() {
  return useQuery({ queryKey: qk.users.roles, queryFn: () => usersService.roles(), staleTime: 6e5 });
}

/** Lock / unlock a platform account. */
export function useToggleUserLock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lock }: { id: string; lock: boolean }) =>
      lock ? usersService.lock(id) : usersService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users.all }),
  });
}

export function useSendConfirmationEmail() {
  return useMutation({ mutationFn: (userId: string) => authService.sendConfirmationEmail(userId) });
}

/* ---- The signed-in account --------------------------------------- */

export function useAccount() {
  return useQuery({ queryKey: qk.account.current, queryFn: () => accountService.get() });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (v: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
      accountService.changePassword(v.currentPassword, v.newPassword, v.confirmNewPassword),
  });
}

export function useSetAccountEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => accountService.setEmail(email),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.account.current }),
  });
}

export function useSetAccountPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { prefix: number | null; phoneNumber: string }) =>
      accountService.setPhoneNumber(v.prefix, v.phoneNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.account.current }),
  });
}
