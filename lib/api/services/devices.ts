import { getPagedItems } from "@/lib/api/client";
import type { Device, DeviceSource } from "@/lib/types";

/** Raw DTO from GET /v1/devices (only the fields we read). */
interface DeviceDto {
  id: string;
  deviceKey: string;
  source: string;
  deviceIp: string;
  channelId: number | null;
  name: string;
  binStationCode: string | null;
  containerCode: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  eventCount: number;
  isOnline: boolean;
}

const SOURCE_MAP: Record<string, DeviceSource> = {
  Camera: "camera",
  Rfid: "rfid",
  Thermal: "thermal",
};
const SOURCE_TO_API: Record<Exclude<DeviceSource, "unknown">, string> = {
  camera: "Camera",
  rfid: "Rfid",
  thermal: "Thermal",
};

function mapDevice(d: DeviceDto): Device {
  return {
    id: d.id,
    deviceKey: d.deviceKey,
    source: SOURCE_MAP[d.source] ?? "unknown",
    ip: d.deviceIp,
    channelId: d.channelId ?? null,
    name: d.name || d.deviceKey,
    stationCode: d.binStationCode ?? null,
    containerCode: d.containerCode ?? null,
    firstSeenAt: d.firstSeenAt ?? null,
    lastSeenAt: d.lastSeenAt ?? null,
    eventCount: d.eventCount ?? 0,
    online: !!d.isOnline,
  };
}

export interface DeviceFilters {
  search?: string;
  source?: DeviceSource | "all";
  online?: "all" | "online" | "offline";
}

const includesCI = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase());

export const devicesService = {
  async list(f: DeviceFilters = {}): Promise<Device[]> {
    const source =
      f.source && f.source !== "all" && f.source !== "unknown" ? SOURCE_TO_API[f.source] : undefined;
    const dtos = await getPagedItems<DeviceDto>("/v1/devices", {
      Source: source,
      OnlineOnly: f.online === "online" ? true : undefined,
    });
    let out = dtos
      .map(mapDevice)
      .sort((a, b) => +new Date(b.lastSeenAt ?? 0) - +new Date(a.lastSeenAt ?? 0));
    if (f.online === "offline") out = out.filter((d) => !d.online);
    if (f.search) {
      out = out.filter(
        (d) =>
          includesCI(d.name, f.search!) ||
          includesCI(d.deviceKey, f.search!) ||
          includesCI(d.stationCode ?? "", f.search!),
      );
    }
    return out;
  },
};
