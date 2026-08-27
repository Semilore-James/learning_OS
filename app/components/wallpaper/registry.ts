import type { WallpaperDef } from "./types";
import {
  Aurora,
  Contour,
  DotGrid,
  GridHorizon,
  Nebula,
  Orbital,
  StarChart,
  Starfield,
} from "./wallpapers";

/**
 * The full set of wallpapers offered in Settings. Procedural SVGs ship now.
 * User-supplied art is added later as `kind: "image"` entries pointing at
 * files in app/public/wallpapers/ — nothing else changes.
 */
export const WALLPAPERS: WallpaperDef[] = [
  { id: "starfield", label: "Starfield", blurb: "Deep space, faint drifting stars. The default.", kind: "svg", Component: Starfield },
  { id: "dot-grid", label: "Dot Grid", blurb: "Clean paper grid. Quiet and flat.", kind: "svg", Component: DotGrid },
  { id: "nebula", label: "Nebula", blurb: "Soft colour clouds in the brand palette.", kind: "svg", Component: Nebula },
  { id: "orbital", label: "Orbital", blurb: "Concentric orbits, slow bodies tracking round.", kind: "svg", Component: Orbital },
  { id: "star-chart", label: "Star Chart", blurb: "Points wired to their nearest neighbours.", kind: "svg", Component: StarChart },
  { id: "aurora", label: "Aurora", blurb: "Slow bands of light across the lower field.", kind: "svg", Component: Aurora },
  { id: "grid-horizon", label: "Grid Horizon", blurb: "A perspective grid receding to a bright line.", kind: "svg", Component: GridHorizon },
  { id: "contour", label: "Contour", blurb: "Topographic rings, like a survey map.", kind: "svg", Component: Contour },

  // --- user-supplied art goes below, e.g.
  // { id: "obs-01", label: "Observatory 01", blurb: "Custom.", kind: "image",
  //   src: { dark: "/wallpapers/obs-01-dark.webp", light: "/wallpapers/obs-01-light.webp" } },
];

export const WALLPAPERS_BY_ID: Record<string, WallpaperDef> = Object.fromEntries(
  WALLPAPERS.map((w) => [w.id, w]),
);
