/**
 * API runtime configuration.
 *
 *   NEXT_PUBLIC_API_URL   where the browser sends API calls. Defaults to the
 *                         same-origin proxy `/api` (app/api/[...path]/route.ts),
 *                         which forwards to API_PROXY_TARGET server-side and
 *                         makes the auth cookie first-party — so it works even
 *                         when the backend is on a different domain. Set to a
 *                         full URL (https://api.example.com) only for a direct,
 *                         same-registrable-domain deployment.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** True when an API base is configured (drives auth bootstrap). Always true here. */
export const REAL = API_BASE.length > 0;
