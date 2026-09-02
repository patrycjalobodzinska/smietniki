/**
 * Typed fetch wrapper for the SprigaAPI backend.
 *
 * Auth is a httpOnly cookie (`__access-token`) set by the sign-in endpoint, so
 * the browser attaches it automatically — we only need `credentials: "include"`.
 * There is no token to read or store in JS. CORS on the API already allows the
 * dev origin with credentials.
 *
 * Services (lib/api/services/*) call `http.*`; nothing above them deals with
 * URLs, cookies, query strings or the paged envelope.
 */

import { API_BASE } from "@/lib/api/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

/** Serialize a query object, dropping null/undefined/"" values. */
function toQueryString(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers:
      body === undefined
        ? { ...init?.headers }
        : { "Content-Type": "application/json", ...init?.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      try {
        payload = await res.text();
      } catch {
        payload = undefined;
      }
    }
    throw new ApiError(res.status, `Request failed: ${res.status}`, payload);
  }

  if (res.status === 204) return undefined as T;

  // Some endpoints (e.g. sign-out) return an empty 200 body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const http = {
  get: <T>(path: string, query?: Query, init?: RequestInit) =>
    request<T>("GET", `${path}${toQueryString(query)}`, undefined, init),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>("POST", path, body, init),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>("PUT", path, body, init),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>("PATCH", path, body, init),
  del: <T>(path: string, init?: RequestInit) =>
    request<T>("DELETE", path, undefined, init),
  /**
   * POST multipart/form-data (file upload). The browser must set the boundary
   * itself, so no Content-Type header is sent here.
   */
  postForm: <T>(path: string, form: FormData, query?: Query) =>
    request<T>("POST", `${path}${toQueryString(query)}`, undefined, { method: "POST", body: form }),
};

/**
 * Absolute (same-origin) URL for a binary endpoint — usable directly as an
 * `<img src>` / download href, since auth is a first-party cookie.
 */
export function assetUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/* ------------------------------------------------------------------ */
/*  Paged envelope                                                     */
/* ------------------------------------------------------------------ */

/** SprigaAPI list envelope: `Paged<T>`. */
export interface Paged<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/** Large page size used when the UI still consumes plain arrays (Phase 0). */
export const BULK_PAGE_SIZE = 500;

/**
 * GET a paged endpoint and return just the items. Pass filters/pagination via
 * `query`; defaults to a single large page so callers can treat it as a list.
 */
export async function getPagedItems<T>(path: string, query?: Query): Promise<T[]> {
  const res = await http.get<Paged<T>>(path, {
    PageNumber: 1,
    PageSize: BULK_PAGE_SIZE,
    ...query,
  });
  return res?.items ?? [];
}
