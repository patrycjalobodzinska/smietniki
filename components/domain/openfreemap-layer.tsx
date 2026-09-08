"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Podkład z OpenFreeMap (https://openfreemap.org, autor: Zsolt Ero, kod:
 * github.com/hyperknot/openfreemap) - darmowe kafelki wektorowe bez klucza API
 * i bez limitów, na danych OpenStreetMap.
 *
 * Kafelki są wektorowe, więc renderuje je MapLibre GL wstawiony do Leafleta
 * przez `@maplibre/maplibre-gl-leaflet`. Reszta mapy - piny, popupy, trasy -
 * zostaje w Leaflecie, bo etykiety i drogi rysuje jedna warstwa GL, a markery
 * i tak leżą nad nią.
 */

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

/** Licencja wymaga wskazania źródła danych i renderera. */
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> ' +
  '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ' +
  'dane &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

export function OpenFreeMapLayer({ dark }: { dark: boolean }) {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: dark ? STYLES.dark : STYLES.light,
      // Leaflet trzyma zoom i pozycję; MapLibre tylko rysuje.
      attributionControl: false,
    });
    layer.addTo(map);

    const credit = L.control.attribution({ prefix: false, position: "bottomright" });
    credit.addAttribution(ATTRIBUTION);
    credit.addTo(map);

    return () => {
      credit.remove();
      layer.remove();
    };
  }, [map, dark]);

  return null;
}
