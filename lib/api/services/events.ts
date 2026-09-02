import { assetUrl, getPagedItems } from "@/lib/api/client";
import type { DeviceSource, RawEvent } from "@/lib/types";

/**
 * Ingest diagnostics (GET /v1/raw-events) and camera snapshots
 * (GET /v1/snapshots/{id}, a JPEG served through the same-origin proxy).
 *
 * These are the events the devices push to `POST /events`: every fill reading,
 * RFID swipe and camera frame lands here first, with retransmission counters.
 */

interface RawEventDto {
  id: string;
  source: string;
  eventType: string | null;
  pid: string | null;
  deviceIp: string | null;
  channelId: number | null;
  occurredAt: string;
  receivedAt: string;
  hasSnapshot: boolean;
  snapshotId: string | null;
  fillValue: number | null;
  isRetransmission: boolean;
  retransmissionCount: number;
}

const SOURCE_MAP: Record<string, DeviceSource> = {
  Camera: "camera",
  Rfid: "rfid",
  Thermal: "thermal",
  Unknown: "unknown",
};
export const SOURCE_TO_API: Record<Exclude<DeviceSource, "unknown">, string> = {
  camera: "Camera",
  rfid: "Rfid",
  thermal: "Thermal",
};

function mapEvent(d: RawEventDto): RawEvent {
  return {
    id: d.id,
    source: SOURCE_MAP[d.source] ?? "unknown",
    eventType: d.eventType ?? null,
    pid: d.pid ?? null,
    deviceIp: d.deviceIp ?? null,
    channelId: d.channelId ?? null,
    occurredAt: d.occurredAt,
    receivedAt: d.receivedAt,
    hasSnapshot: !!d.hasSnapshot,
    snapshotId: d.snapshotId ?? null,
    fillValue: d.fillValue ?? null,
    isRetransmission: !!d.isRetransmission,
    retransmissionCount: d.retransmissionCount ?? 0,
  };
}

export interface RawEventFilters {
  source?: DeviceSource | "all";
  eventType?: string;
  pid?: string;
  from?: string;
  to?: string;
  /** Client-side toggles (no server-side filter). */
  onlySnapshots?: boolean;
  onlyRetransmissions?: boolean;
  limit?: number;
}

/** JPEG snapshot URL — auth travels as the first-party cookie, so use it directly. */
export function snapshotUrl(snapshotId: string): string {
  return assetUrl(`/v1/snapshots/${snapshotId}`);
}

export const eventsService = {
  async list(f: RawEventFilters = {}): Promise<RawEvent[]> {
    const source =
      f.source && f.source !== "all" && f.source !== "unknown" ? SOURCE_TO_API[f.source] : undefined;
    const dtos = await getPagedItems<RawEventDto>("/v1/raw-events", {
      Source: source,
      EventType: f.eventType,
      Pid: f.pid,
      From: f.from,
      To: f.to,
    });
    let out = dtos
      .map(mapEvent)
      .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
    if (f.source === "unknown") out = out.filter((e) => e.source === "unknown");
    if (f.onlySnapshots) out = out.filter((e) => e.hasSnapshot);
    if (f.onlyRetransmissions) out = out.filter((e) => e.isRetransmission);
    if (f.limit) out = out.slice(0, f.limit);
    return out;
  },

  /** No GET /raw-events/{id} — resolve the event from the feed. */
  async get(id: string): Promise<RawEvent | undefined> {
    return (await this.list()).find((e) => e.id === id);
  },

  /** Latest snapshot-bearing events, used for the Vision tiles on a station. */
  async snapshots(limit = 4, deviceIp?: string): Promise<RawEvent[]> {
    const events = await this.list({ source: "camera", onlySnapshots: true });
    const scoped = deviceIp ? events.filter((e) => e.deviceIp === deviceIp) : events;
    return scoped.slice(0, limit);
  },
};
