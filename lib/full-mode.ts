"use client";

import { useEffect, useState } from "react";

/**
 * "Full mode" — a hidden unlock that reveals the extra modules removed from the
 * KM1 panel (odbiory, trasy, spółdzielnie, nieruchomości, features).
 *
 * Unlock: on the login form, append the secret code to the password
 * (default `::pelny`, override with NEXT_PUBLIC_FULL_CODE). It is stripped
 * before the real API login and flips a local flag. This is cosmetic gating
 * (client-side), suitable for a demo — not a security boundary.
 */

export const FULL_CODE = process.env.NEXT_PUBLIC_FULL_CODE ?? "::pelny";

const STORAGE_KEY = "sw-full";
const EVENT = "sw-full-change";

export function isFullMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setFullMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

/** If the password carries the secret code, strip it and return unlock=true. */
export function extractUnlock(password: string): { password: string; unlock: boolean } {
  if (FULL_CODE && password.endsWith(FULL_CODE)) {
    return { password: password.slice(0, -FULL_CODE.length), unlock: true };
  }
  return { password, unlock: false };
}

/** Reactive full-mode flag for client components. */
export function useFullMode(): boolean {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const read = () => setFull(isFullMode());
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return full;
}
