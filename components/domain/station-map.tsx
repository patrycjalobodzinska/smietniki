"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L, { type LatLngExpression, type LatLngBoundsExpression, type DivIcon } from "leaflet";
import { fillTone, type BinStation, type FillTone } from "@/lib/types";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { VARIANT_SHORT } from "@/lib/labels";

/** Marker fill colors (spec §21.4) — stable across themes. */
const TONE_HEX: Record<FillTone, string> = {
  low: "#39a96b",
  mid: "#f2c94c",
  high: "#f2994a",
  critical: "#eb5757",
};
const NONE_HEX = "#7d9085";

/** Cache one DivIcon per (color, critical) combo — cheap + keeps markers stable. */
const iconCache = new Map<string, DivIcon>();

function pinIcon(level: number | null): DivIcon {
  const tone = level === null ? null : fillTone(level);
  const color = tone === null ? NONE_HEX : TONE_HEX[tone];
  const critical = tone === "critical";
  const key = `${color}|${critical}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "sw-pin-icon",
    html:
      `<div class="sw-pin" style="--pin:${color}">` +
      (critical ? `<span class="sw-pin__pulse"></span>` : "") +
      `<span class="sw-pin__tail"></span><span class="sw-pin__body"></span><span class="sw-pin__dot"></span></div>`,
    iconSize: [28, 44],
    iconAnchor: [14, 44],
    popupAnchor: [0, -42],
  });
  iconCache.set(key, icon);
  return icon;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

export interface StationMapProps {
  stations: BinStation[];
  /** Ordered coordinates to draw a route polyline. */
  routePath?: LatLngExpression[];
  height?: number | string;
}

export function StationMap({ stations, routePath, height = 360 }: StationMapProps) {
  const dark = useIsDark();

  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!stations.length) return null;
    return stations.map((s) => [s.location.lat, s.location.lng]) as LatLngBoundsExpression;
  }, [stations]);

  const center: LatLngExpression = stations.length
    ? [stations[0].location.lat, stations[0].location.lng]
    : [50.0413, 22.0038];

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "var(--color-muted)" }}
        attributionControl={false}
      >
        {/* CARTO basemaps — no API key required. */}
        <TileLayer url={tileUrl} subdomains={["a", "b", "c", "d"]} />
        <FitBounds bounds={bounds} />

        {routePath && routePath.length > 1 && (
          <Polyline positions={routePath} pathOptions={{ color: "#39a96b", weight: 4, opacity: 0.85 }} />
        )}

        {stations.map((s) => (
          <Marker key={s.id} position={[s.location.lat, s.location.lng]} icon={pinIcon(s.avgFillLevel)}>
            <Popup>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold">{s.name}</p>
                <p className="text-neutral-500">{s.address}</p>
                <p>
                  Zapełnienie:{" "}
                  <strong>{s.avgFillLevel === null ? "N/D" : `${s.avgFillLevel}%`}</strong>
                </p>
                <p>Wariant: {VARIANT_SHORT[s.deploymentVariant]}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
