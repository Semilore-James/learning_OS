import type { WallpaperDef } from "./types";
import {
  Aurora,
  Contour,
  DotGrid,
  GridHorizon,
  Luna,
  Nebula,
  Nightside,
  Orbital,
  Quasar,
  StarChart,
  Starfield,
} from "./wallpapers";

/**
 * Wallpapers offered in Settings. Procedural SVGs ship now. User-supplied art
 * is added as `kind: "image"` entries pointing at files in
 * app/public/wallpapers/ — nothing else changes.
 */
export const WALLPAPERS: WallpaperDef[] = [
  { id: "starfield", label: "Starfield", blurb: "Dense drifting stars, a few burning bright. The default.", kind: "svg", Component: Starfield },
  { id: "star-chart", label: "Star Chart", blurb: "Points wired to their nearest neighbours, hubs glowing.", kind: "svg", Component: StarChart },
  { id: "orbital", label: "Orbital", blurb: "Concentric orbits, coloured bodies tracking round.", kind: "svg", Component: Orbital },
  { id: "quasar", label: "Quasar", blurb: "A bright galactic core with a bipolar jet.", kind: "svg", Component: Quasar },
  { id: "nightside", label: "Nightside", blurb: "A dark planet crescent, city lights along the terminator.", kind: "svg", Component: Nightside },
  { id: "luna", label: "Luna", blurb: "A large moon, close and quiet.", kind: "svg", Component: Luna },
  { id: "nebula", label: "Nebula", blurb: "Soft colour clouds in the brand palette.", kind: "svg", Component: Nebula },
  { id: "aurora", label: "Aurora", blurb: "Slow bands of light across the lower field.", kind: "svg", Component: Aurora },
  { id: "grid-horizon", label: "Grid Horizon", blurb: "A perspective grid receding to a bright line.", kind: "svg", Component: GridHorizon },
  { id: "contour", label: "Contour", blurb: "Topographic rings, like a survey map.", kind: "svg", Component: Contour },
  { id: "dot-grid", label: "Dot Grid", blurb: "Clean grid, brighter toward the centre.", kind: "svg", Component: DotGrid },

  // --- user-supplied art: drop files in app/public/wallpapers/ and uncomment ---
  // { id: "art-quasar", label: "Quasar (photo)", blurb: "Custom.", kind: "image",
  //   src: { dark: "/wallpapers/quasar.webp", light: "/wallpapers/quasar-light.webp" } },
  // { id: "art-nightside", label: "Nightside (photo)", blurb: "Custom.", kind: "image",
  //   src: { dark: "/wallpapers/nightside.webp" } },
  // { id: "art-luna", label: "Luna (photo)", blurb: "Custom.", kind: "image",
  //   src: { dark: "/wallpapers/luna.webp" } },
];

export const WALLPAPERS_BY_ID: Record<string, WallpaperDef> = Object.fromEntries(
  WALLPAPERS.map((w) => [w.id, w]),
);
