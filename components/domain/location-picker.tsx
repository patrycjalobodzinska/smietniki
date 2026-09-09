"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { OpenFreeMapLayer } from "@/components/domain/openfreemap-layer";

/**
 * Wybór punktu na mapie dla formularza altanki: przeciągalny pin, klik w mapę
 * ustawia pozycję, a przycisk obok adresu przenosi mapę pod wskazany adres
 * (geokodowanie w `lib/api/geocode.ts`).
 *
 * Komponent jest kontrolowany - stanem współrzędnych zarządza formularz, żeby
 * pola liczbowe i mapa nigdy się nie rozjechały.
 */

/** Rzeszów - środek obszaru działania, gdy altanka nie ma jeszcze pozycji. */
const FALLBACK: [number, number] = [50.0413, 22.0038];

const pin = L.divIcon({
  className: "sw-pin-icon",
  html: `<div class="sw-pin" style="--pin:#3f9b45"><span class="sw-pin__tail"></span><span class="sw-pin__body"></span><span class="sw-pin__dot"></span></div>`,
  iconSize: [28, 44],
  iconAnchor: [14, 44],
});

/**
 * Przesuwa widok tylko wtedy, gdy pozycja przyszła spoza mapy: trafienie
 * geokodera przybliża do adresu, ręcznie wpisane współrzędne poza kadrem
 * wciągają widok z powrotem. Przeciągnięcie pinu i klik w mapę zostawiają
 * kadr w spokoju - punkt i tak jest widoczny.
 */
function Recenter({ position, flyToken }: { position: [number, number]; flyToken: number }) {
  const map = useMap();
  const lastToken = useRef(flyToken);
  useEffect(() => {
    if (flyToken !== lastToken.current) {
      lastToken.current = flyToken;
      map.setView(position, 17, { animate: true });
      return;
    }
    if (!map.getBounds().contains(position)) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, position, flyToken]);
  return null;
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
  /** Rośnie przy każdym trafieniu geokodera - wymusza dociągnięcie zoomu. */
  flyToken?: number;
}

export function LocationPicker({ lat, lng, onChange, height = 260, flyToken = 0 }: LocationPickerProps) {
  const dark = useIsDark();
  const placed = lat !== null && lng !== null;
  const position = useMemo<[number, number]>(() => (placed ? [lat, lng] : FALLBACK), [placed, lat, lng]);

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border" style={{ height }}>
      <MapContainer
        center={position}
        zoom={placed ? 16 : 12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "var(--color-muted)" }}
        // Zakres zoomu podawała wcześniej warstwa kafelków rastrowych; warstwa
        // wektorowa nie zgłasza żadnego, a bez niego Leaflet dopuszcza zoom
        // nieskończony, którego MapLibre nie przyjmuje.
        minZoom={3}
        maxZoom={19}
        // Atrybucję dokłada OpenFreeMapLayer - domyślna kontrolka Leafleta
        // pokazywałaby obok pusty box z samym odnośnikiem do Leafleta.
        attributionControl={false}
      >
        <OpenFreeMapLayer dark={dark} />
        <Recenter position={position} flyToken={flyToken} />
        <ClickToPlace onPick={onChange} />
        {placed && (
          <Marker
            position={position}
            icon={pin}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng();
                onChange(p.lat, p.lng);
              },
            }}
          />
        )}
      </MapContainer>

      {!placed && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] bg-card/90 px-3 py-2 text-center text-xs text-muted-foreground">
          Kliknij w mapę lub użyj &bdquo;Znajdź po adresie&rdquo;, żeby ustawić pozycję.
        </p>
      )}
    </div>
  );
}
