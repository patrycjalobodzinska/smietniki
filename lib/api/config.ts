/**
 * API runtime configuration.
 *
 * The browser ALWAYS calls the same-origin proxy at `/api`
 * (app/api/[...path]/route.ts), which forwards to the real backend
 * server-side (API_PROXY_TARGET, a runtime env var) and rewrites the auth
 * cookie to be first-party. This makes cross-domain backends work in every
 * browser (Safari/Chrome/Firefox third-party-cookie blocking) and — crucially —
 * cannot be broken by a stale build-time `NEXT_PUBLIC_API_URL`.
 *
 * Configure the backend URL at runtime via API_PROXY_TARGET (server env),
 * default https://spriga-api.essa.sx.
 */

export const API_BASE = "/api";

/** Kept for the auth bootstrap; always true (we always talk to the proxy). */
export const REAL = true;
