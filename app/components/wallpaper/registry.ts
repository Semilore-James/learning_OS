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
import { BlackHole, Galaxy, MilkyWay, Saturn, SpaceStation } from "./wallpapersSpace";

/**
 * Wallpapers offered in Settings. Procedural SVGs ship now. User-supplied art
 * is added as `kind: "image"` entries pointing at files in
 * app/public/wallpapers/ — nothing else changes.
 */
export const WALLPAPERS: WallpaperDef[] = [
  { id: "starfield", label: "Starfield", blurb: "Dense drifting stars, a few burning bright. The default.", kind: "svg", Component: Starfield },
  { id: "milky-way", label: "Milky Way", blurb: "The galactic band arcing across the sky, dust lanes and all.", kind: "svg", Component: MilkyWay },
  { id: "galaxy", label: "Galaxy", blurb: "A spiral seen on the tilt, arms turning slowly.", kind: "svg", Component: Galaxy },
  { id: "black-hole", label: "Black Hole", blurb: "Density-plotted accretion disk, blue-white in, deep red out.", kind: "svg", Component: BlackHole },
  { id: "saturn", label: "Saturn", blurb: "Banded planet, ring system with the Cassini gap.", kind: "svg", Component: Saturn },
  { id: "space-station", label: "Space Station", blurb: "Truss and solar wings over a planet limb.", kind: "svg", Component: SpaceStation },
  { id: "star-chart", label: "Star Chart", blurb: "Points wired to their nearest neighbours, hubs glowing.", kind: "svg", Component: StarChart },
  { id: "orbital", label: "Orbital", blurb: "Concentric orbits, coloured bodies tracking their rings.", kind: "svg", Component: Orbital },
  { id: "quasar", label: "Quasar", blurb: "A bright galactic core with a bipolar jet, dust twinkling.", kind: "svg", Component: Quasar },
  { id: "nightside", label: "Nightside", blurb: "A planet limb from low orbit, atmosphere lit on the horizon.", kind: "svg", Component: Nightside },
  { id: "luna", label: "Luna", blurb: "A crescent moon, craters along the terminator.", kind: "svg", Component: Luna },
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
