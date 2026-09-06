/**
 * Geokodowanie adresu przez Nominatim (OpenStreetMap) - otwarte API, bez
 * klucza. Wołane wyłącznie z akcji użytkownika (przycisk "Znajdź"), nigdy
 * w pętli, bo polityka Nominatim dopuszcza ~1 zapytanie na sekundę.
 *
 * Zapytania idą prosto z przeglądarki - to inny host niż SprigaAPI, więc nie
 * przechodzą przez nasz proxy `/api`.
 */

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

export interface GeocodeHit {
  lat: number;
  lng: number;
  /** Pełna nazwa dopasowanego miejsca, do pokazania użytkownikowi. */
  label: string;
}

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Zwraca do `limit` dopasowań dla zapytania. Pusta tablica = brak wyników;
 * błąd sieci/API leci wyżej jako wyjątek.
 */
export async function geocode(query: string, limit = 5): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL(ENDPOINT);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("addressdetails", "0");
  // System działa w Polsce - zawężenie odsiewa dopasowania z całego świata.
  url.searchParams.set("countrycodes", "pl");
  url.searchParams.set("accept-language", "pl");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);

  const items = (await res.json()) as NominatimItem[];
  return items
    .map((i) => ({ lat: Number(i.lat), lng: Number(i.lon), label: i.display_name }))
    .filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));
}
