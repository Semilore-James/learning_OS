import type { ComponentType } from "react";

export type Theme = "dark" | "light";

export type WallpaperKind = "svg" | "image";

export interface WallpaperProps {
  theme: Theme;
  /** true when prefers-reduced-motion is set — components should render static */
  reducedMotion: boolean;
}

export interface WallpaperDef {
  id: string;
  label: string;
  /** one-line description shown under the swatch in Settings */
  blurb: string;
  kind: WallpaperKind;
  /** kind: "svg" — a full-bleed component built from CSS tokens */
  Component?: ComponentType<WallpaperProps>;
  /**
   * kind: "image" — user-supplied art added later. Paths live in
   * app/public/wallpapers/. Provide both themes; if only one is given it is
   * used for both.
   */
  src?: { dark: string; light?: string };
}

export const DEFAULT_WALLPAPER_ID = "starfield";
