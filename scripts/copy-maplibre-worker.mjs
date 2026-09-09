/**
 * Kopiuje workera MapLibre do `public/maplibre/`.
 *
 * MapLibre 6 wylicza adres workera jako plik obok własnego modułu
 * (`new URL("./maplibre-gl-worker.mjs", import.meta.url)`). Pod bundlerem jego
 * modułem jest chunk w `/_next/static/chunks/`, gdzie takiego pliku nie ma -
 * przeglądarka dostaje wtedy stronę 404 w HTML-u i worker nie startuje, a mapa
 * zostaje pustym płótnem. Dlatego serwujemy workera sami i wskazujemy go przez
 * `setWorkerUrl` (patrz components/domain/openfreemap-layer.tsx).
 *
 * Worker importuje `./maplibre-gl-shared.mjs`, więc oba pliki muszą leżeć
 * razem. Skrypt biegnie w `predev` i `prebuild`, żeby po aktualizacji paczki
 * kopia nie została w starej wersji.
 */

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(dirname(require.resolve("maplibre-gl/package.json")), "dist");
const target = join(root, "public", "maplibre");

mkdirSync(target, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(dist, file), join(target, file));
}

const { version } = require("maplibre-gl/package.json");
console.log(`maplibre worker ${version} -> public/maplibre/`);
