/* ============================================================================
   Feature flags. Half-built features merge to main behind a flag so main
   always builds and deploys green (Phase 0 step 2).

   Read from NEXT_PUBLIC_FLAGS as a comma list, e.g.
     NEXT_PUBLIC_FLAGS="pmAI,canvas,games"
   Anything not listed is OFF in production and ON in development, so local
   work sees everything and prod only sees what is finished.
   ========================================================================== */

export type Flag =
  | "constellation"
  | "textbook"
  | "cheatcodes"
  | "dailyLog"
  | "heatmap"
  | "videoLibrary"
  | "caseFiles"
  | "pmAI"
  | "canvas"
  | "games"
  | "toolkit"
  | "reviewQueue"
  | "diagnostic"
  | "commandPalette"
  | "sharePage";

const enabled = new Set(
  (process.env.NEXT_PUBLIC_FLAGS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const isDev = process.env.NODE_ENV !== "production";

export function flag(name: Flag): boolean {
  return enabled.has(name) || isDev;
}
