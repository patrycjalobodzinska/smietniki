"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L, { type LatLngExpression, type LatLngBoundsExpression, type DivIcon } from "leaflet";
import { fillTone, type BinStation, type FillTone, type GeoPoint } from "@/lib/types";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { OpenFreeMapLayer } from "@/components/domain/openfreemap-layer";
import { VARIANT_SHORT } from "@/lib/labels";

/** Marker fill colors (spec §21.4) - stable across themes. */
const TONE_HEX: Record<FillTone, string> = {
  low: "#39a96b",
  mid: "#f2c94c",
  high: "#f2994a",
  critical: "#eb5757",
};
const NONE_HEX = "#7d9085";

/** Cache one DivIcon per (color, critical) combo - cheap + keeps markers stable. */
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
    if (!bounds) return;
    // Puste lub niekompletne granice (altanka bez współrzędnych) wywracały
    // `fitBounds` w środku Leafleta - sprawdzamy je, zanim tam trafią.
    const box = bounds instanceof L.LatLngBounds ? bounds : L.latLngBounds(bounds);
    if (!box.isValid()) return;
    map.fitBounds(box, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

export interface StationMapProps {
  stations: BinStation[];
  /** Ordered coordinates to draw a route polyline. */
  routePath?: LatLngExpression[];
  height?: number | string;
}

/** Rzeszów - środek obszaru działania, gdy nie ma czego wyśrodkować. */
const FALLBACK_CENTER: LatLngExpression = [50.0413, 22.0038];

export function StationMap({ stations, routePath, height = 360 }: StationMapProps) {
  const dark = useIsDark();
  const [glReady, setGlReady] = useState(false);

  /**
   * Altanka bez pozycji nie trafia na mapę. Wcześniej jej `null` wchodził do
   * granic widoku i `map.fitBounds` wywracał się na braku współrzędnej.
   */
  const placed = useMemo(
    () => stations.filter((s): s is BinStation & { location: GeoPoint } => s.location !== null),
    [stations],
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!placed.length) return null;
    return placed.map((s) => [s.location.lat, s.location.lng]) as LatLngBoundsExpression;
  }, [placed]);

  const center: LatLngExpression = placed.length
    ? [placed[0].location.lat, placed[0].location.lng]
    : FALLBACK_CENTER;

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "var(--color-muted)" }}
        // Atrybucję dokłada OpenFreeMapLayer - domyślna kontrolka Leafleta
        // pokazywałaby obok pusty box z samym odnośnikiem do Leafleta.
        attributionControl={false}
      >
        <OpenFreeMapLayer dark={dark} onReady={() => setGlReady(true)} />
        {/* Dopasowanie kadru czeka na wczytany styl - patrz OpenFreeMapLayer. */}
        <FitBounds bounds={glReady ? bounds : null} />

        {routePath && routePath.length > 1 && (
          <Polyline positions={routePath} pathOptions={{ color: "#39a96b", weight: 4, opacity: 0.85 }} />
        )}

        {placed.map((s) => (
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
