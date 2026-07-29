/**
 * Centralized React Query keys. Every hook derives its key from here so
 * invalidation stays consistent.
 */
export const qk = {
  cooperatives: {
    all: ["cooperatives"] as const,
    list: (f?: object) => ["cooperatives", "list", f ?? {}] as const,
    detail: (id: string) => ["cooperatives", "detail", id] as const,
  },
  properties: {
    all: ["properties"] as const,
    list: (f?: object) => ["properties", "list", f ?? {}] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
  },
  stations: {
    all: ["stations"] as const,
    list: (f?: object) => ["stations", "list", f ?? {}] as const,
    detail: (id: string) => ["stations", "detail", id] as const,
  },
  containers: {
    all: ["containers"] as const,
    list: (f?: object) => ["containers", "list", f ?? {}] as const,
    detail: (id: string) => ["containers", "detail", id] as const,
    history: (id: string) => ["containers", "history", id] as const,
  },
  units: {
    all: ["units"] as const,
    list: (propertyId: string) => ["units", "list", propertyId] as const,
  },
  sessionsDetail: (id: string) => ["sessions", "detail", id] as const,
  collectionsDetail: (id: string) => ["collections", "detail", id] as const,
  sessions: {
    all: ["sessions"] as const,
    list: (f?: object) => ["sessions", "list", f ?? {}] as const,
  },
  collections: {
    all: ["collections"] as const,
    list: (f?: object) => ["collections", "list", f ?? {}] as const,
  },
  routes: {
    all: ["routes"] as const,
    list: (f?: object) => ["routes", "list", f ?? {}] as const,
    detail: (id: string) => ["routes", "detail", id] as const,
  },
  vehicles: { list: () => ["vehicles", "list"] as const },
  dashboard: { summary: ["dashboard", "summary"] as const },
  analytics: {
    insights: ["analytics", "insights"] as const,
    dashboard: ["analytics", "dashboard"] as const,
    rankings: ["analytics", "rankings"] as const,
  },
};
