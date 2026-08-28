/* ============================================================================
   App registry — the single list of everything that can open as a window.
   Consumed by the desktop icon grid, the taskbar, and (later) the command
   palette. Each entry names the feature flag that gates it and the component
   that renders its body.
   ========================================================================== */
import type { ComponentType, ReactNode } from "react";
import type { Flag } from "@/lib/flags";
import { Placeholder } from "@/components/desktop/Placeholder";
import { SettingsWindow } from "@/components/settings/SettingsWindow";
import {
  GlyphCanvas,
  GlyphCaseFiles,
  GlyphCheatcodes,
  GlyphConstellation,
  GlyphDailyLog,
  GlyphGames,
  GlyphHeatmap,
  GlyphPmAi,
  GlyphSettings,
  GlyphToolkit,
  GlyphVideo,
} from "@/components/desktop/glyphs";

export interface AppDef {
  id: string;
  label: string;
  hint: string;
  glyph: ReactNode;
  /** feature flag gating this app; omitted = always available */
  flag?: Flag;
  win: { title: string; subtitle?: string; width: number; height: number };
  Body: ComponentType;
}

const ph = (feature: string, step: string): ComponentType => {
  const C = () => <Placeholder feature={feature} step={step} />;
  C.displayName = `Placeholder(${feature})`;
  return C;
};

export const APPS: AppDef[] = [
  {
    id: "constellation",
    label: "Constellation\nMap",
    hint: "Your learning path",
    glyph: <GlyphConstellation />,
    flag: "constellation",
    win: { title: "Constellation Map", subtitle: "TRACK 01", width: 860, height: 640 },
    Body: ph("Constellation Map", "Phase 1 · step 11"),
  },
  {
    id: "video",
    label: "Video\nLibrary",
    hint: "Watch and learn",
    glyph: <GlyphVideo />,
    flag: "videoLibrary",
    win: { title: "Video Library", width: 720, height: 580 },
    Body: ph("Video Library", "Phase 1 · step 15"),
  },
  {
    id: "casefiles",
    label: "Case\nFiles",
    hint: "20 real scenarios",
    glyph: <GlyphCaseFiles />,
    flag: "caseFiles",
    win: { title: "Case Files", subtitle: "20 MISSIONS", width: 620, height: 560 },
    Body: ph("Case Files", "Phase 1 · step 16"),
  },
  {
    id: "pmai",
    label: "PM-AI",
    hint: "Your advisor",
    glyph: <GlyphPmAi />,
    flag: "pmAI",
    win: { title: "PM-AI", width: 560, height: 620 },
    Body: ph("PM-AI", "Phase 1 · step 17"),
  },
  {
    id: "heatmap",
    label: "Heatmap",
    hint: "Your activity",
    glyph: <GlyphHeatmap />,
    flag: "heatmap",
    win: { title: "Heatmap", width: 780, height: 420 },
    Body: ph("Heatmap", "Phase 1 · step 14"),
  },
  {
    id: "canvas",
    label: "Canvas",
    hint: "Think on paper",
    glyph: <GlyphCanvas />,
    flag: "canvas",
    win: { title: "Canvas", width: 900, height: 640 },
    Body: ph("Canvas", "Phase 1 · step 19"),
  },
  {
    id: "games",
    label: "Games",
    hint: "SQL, logic, data",
    glyph: <GlyphGames />,
    flag: "games",
    win: { title: "Games", width: 760, height: 600 },
    Body: ph("Games", "Phase 1 · step 20"),
  },
  {
    id: "cheatcodes",
    label: "Cheatcodes",
    hint: "SQL and Excel reference",
    glyph: <GlyphCheatcodes />,
    flag: "cheatcodes",
    win: { title: "Cheatcodes", subtitle: "QUICK REFERENCE", width: 760, height: 600 },
    Body: ph("Cheatcodes", "Phase 1 · step 13"),
  },
  {
    id: "dailylog",
    label: "Daily\nLog",
    hint: "One line a day",
    glyph: <GlyphDailyLog />,
    flag: "dailyLog",
    win: { title: "Daily Log", width: 460, height: 560 },
    Body: ph("Daily Log", "Phase 1 · step 14"),
  },
  {
    id: "toolkit",
    label: "Toolkit",
    hint: "What to install to practice",
    glyph: <GlyphToolkit />,
    flag: "toolkit",
    win: { title: "Toolkit", subtitle: "THE LOADOUT", width: 820, height: 620 },
    Body: ph("Toolkit", "Phase 1 · step 18"),
  },
];

export const APPS_BY_ID: Record<string, AppDef> = Object.fromEntries(
  APPS.map((a) => [a.id, a]),
);

/** Settings is not a desktop icon (opened from the taskbar avatar) but is a
 *  window like any other. */
export const SETTINGS_APP: AppDef = {
  id: "settings",
  label: "Settings",
  hint: "Theme, skin, wallpaper",
  glyph: <GlyphSettings />,
  win: { title: "Settings", width: 560, height: 600 },
  Body: SettingsWindow,
};

export const ALL_APPS: Record<string, AppDef> = { ...APPS_BY_ID, settings: SETTINGS_APP };
