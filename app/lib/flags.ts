/* ============================================================================
   Feature flags. Half-built features merge to main behind a flag so main
   always builds and deploys green (Phase 0 step 2).

   Precedence:
     1. NEXT_PUBLIC_FLAGS set  -> exactly that comma list is on in production
        e.g. NEXT_PUBLIC_FLAGS="pmAI,canvas,games"
     2. NEXT_PUBLIC_FLAGS unset -> the SHIPPED list below is on in production
     3. development             -> everything is on regardless
   A feature that is not finished is left out of SHIPPED (and out of the env
   var) until it is done. Setting the env var is still the explicit override.
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
  | "sharePage"
  | "shop"
  | "pmVision";

/** Finished and safe to show in production when NEXT_PUBLIC_FLAGS is not set. */
const SHIPPED: Flag[] = [
  "constellation",
  "textbook",
  "cheatcodes",
  "dailyLog",
  "heatmap",
  "videoLibrary",
  "caseFiles",
  "pmAI",
  "canvas",
  "games",
  "toolkit",
  "reviewQueue",
  "diagnostic",
  "commandPalette",
  "sharePage",
  "pmVision",
  // "shop" — built but not launched. On in dev; off in prod until the shop
  //   pass lands (branch: shop-followups). Flip on here, or add to
  //   NEXT_PUBLIC_FLAGS, when ready.
];

const fromEnv = (process.env.NEXT_PUBLIC_FLAGS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const enabled = new Set<string>(fromEnv.length > 0 ? fromEnv : SHIPPED);

const isDev = process.env.NODE_ENV !== "production";

export function flag(name: Flag): boolean {
  return enabled.has(name) || isDev;
}
