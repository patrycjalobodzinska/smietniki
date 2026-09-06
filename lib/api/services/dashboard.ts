import { http } from "@/lib/api/client";

/**
 * Platform summary from GET /v1/dashboard/summary - live aggregates across
 * ingest, devices, fill telemetry and access. Shape mirrors the API 1:1.
 */
export interface DashboardSummary {
  ingest: {
    totalEvents: number;
    last24hEvents: number;
    cameraEvents: number;
    rfidEvents: number;
    thermalEvents: number;
    unknownEvents: number;
    totalRetransmissions: number;
    lastEventAt: string | null;
  };
  devices: { total: number; online: number; offline: number };
  fill: {
    totalMeasurements: number;
    autoMeasurements: number;
    manualMeasurements: number;
    last24hMeasurements: number;
    averageFill: number;
  };
  access: { totalSessions: number; last24hSessions: number };
  generatedAt: string;
}

export const dashboardService = {
  summary: (): Promise<DashboardSummary> => http.get<DashboardSummary>("/v1/dashboard/summary"),
};
