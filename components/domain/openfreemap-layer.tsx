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

export function OpenFreeMapLayer({
  dark,
  onReady,
}: {
  dark: boolean;
  /**
   * Wołane, gdy MapLibre wczyta styl. Dopóki styl się nie wczyta, każda zmiana
   * widoku Leafleta (np. `fitBounds`) idzie do nieprzygotowanej transformacji
   * MapLibre i wywraca się w środku biblioteki - dlatego dopasowanie kadru
   * czeka na ten sygnał.
   */
  onReady?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: dark ? STYLES.dark : STYLES.light,
      // Leaflet trzyma zoom i pozycję; MapLibre tylko rysuje.
      attributionControl: false,
    });
    layer.addTo(map);

    /**
     * `map.addLayer` odkłada `onAdd` przez `whenReady`, więc instancja MapLibre
     * powstaje dopiero wtedy - sięganie po nią od razu zwracało `undefined`.
     * Sygnał gotowości wysyłamy zawsze, także gdy nie da się go dopiąć do
     * zdarzenia `load`, żeby dopasowanie kadru nie zostało zablokowane.
     */
    let signalled = false;
    const signal = () => {
      if (signalled) return;
      signalled = true;
      onReady?.();
    };

    map.whenReady(() => {
      const gl = layer.getMaplibreMap();
      if (!gl) return signal();
      if (gl.isStyleLoaded()) return signal();
      gl.once("load", signal);
      gl.once("error", signal);
    });

    const credit = L.control.attribution({ prefix: false, position: "bottomright" });
    credit.addAttribution(ATTRIBUTION);
    credit.addTo(map);

    return () => {
      credit.remove();
      layer.remove();
    };
    // `onReady` celowo poza zależnościami - jego zmiana nie ma przebudowywać
    // warstwy GL, a wywołanie jest jednorazowe na cykl życia stylu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, dark]);

  return null;
}
