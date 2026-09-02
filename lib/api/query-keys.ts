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
  devices: {
    all: ["devices"] as const,
    list: (f?: object) => ["devices", "list", f ?? {}] as const,
  },
  accessKeys: {
    all: ["access-keys"] as const,
    list: (f?: object) => ["access-keys", "list", f ?? {}] as const,
    units: ["access-keys", "units"] as const,
  },
  fill: {
    all: ["fill"] as const,
    measurements: (f?: object) => ["fill", "measurements", f ?? {}] as const,
  },
  events: {
    all: ["events"] as const,
    list: (f?: object) => ["events", "list", f ?? {}] as const,
    forContainer: (code: string) => ["events", "container", code] as const,
    forStation: (code: string) => ["events", "station", code] as const,
  },
  users: {
    all: ["users"] as const,
    list: (f?: object) => ["users", "list", f ?? {}] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    roles: ["users", "roles"] as const,
  },
  account: { current: ["account", "current"] as const },
  activities: {
    all: ["activities"] as const,
    list: (f?: object) => ["activities", "list", f ?? {}] as const,
    detail: (id: string) => ["activities", "detail", id] as const,
    types: ["activities", "types"] as const,
  },
  emails: {
    all: ["emails"] as const,
    list: (f?: object) => ["emails", "list", f ?? {}] as const,
    detail: (id: string) => ["emails", "detail", id] as const,
    meta: ["emails", "meta"] as const,
  },
  pushs: {
    all: ["pushs"] as const,
    list: (f?: object) => ["pushs", "list", f ?? {}] as const,
    detail: (id: string) => ["pushs", "detail", id] as const,
    meta: ["pushs", "meta"] as const,
  },
  articles: {
    all: ["articles"] as const,
    list: (f?: object) => ["articles", "list", f ?? {}] as const,
    detail: (id: string) => ["articles", "detail", id] as const,
    categories: (f?: object) => ["articles", "categories", f ?? {}] as const,
  },
  files: {
    all: ["files"] as const,
    detail: (id: string) => ["files", "detail", id] as const,
    containers: ["files", "containers"] as const,
  },
  analytics: {
    insights: ["analytics", "insights"] as const,
    dashboard: ["analytics", "dashboard"] as const,
    rankings: ["analytics", "rankings"] as const,
  },
};
