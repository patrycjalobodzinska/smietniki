/**
 * API runtime configuration. The app talks to the live SprigaAPI backend.
 *
 *   NEXT_PUBLIC_API_URL   base URL of SprigaAPI (e.g. https://spriga-api.essa.sx)
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** True when an API base URL is configured (drives auth bootstrap). */
export const REAL = API_BASE.length > 0;
