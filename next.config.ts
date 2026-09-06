import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Wyłączony wyłącznie z powodu react-leaflet 5.0.0: pod React 19 tryb ścisły
   * montuje komponent dwa razy, a `MapContainer` po pierwszym sprzątnięciu nie
   * odtwarza mapy. Efekt to niezłapany wyjątek z `TileLayer`, który wywala całe
   * drzewo - stąd martwe przyciski na ekranach z mapą.
   *
   * Tryb ścisły działa tylko w dev, więc produkcja zachowuje się identycznie.
   * Do włączenia z powrotem, gdy react-leaflet wypuści poprawkę (5.0.0 jest
   * na dziś najnowsze).
   */
  reactStrictMode: false,
};

export default nextConfig;
