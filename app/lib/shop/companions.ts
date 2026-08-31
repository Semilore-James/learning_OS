/* ============================================================================
   Desktop companion sprite metadata.

   Art: Ninja Adventure Asset Pack by pixel-boy (CC0). Each character is sliced
   from the pack's 4x7 (16px) sheet into per-animation horizontal strips of
   80px frames, served from the Supabase Storage bucket "shop-assets" at
     <base>/companions/<name>/<anim>.png
   base = NEXT_PUBLIC_SHOP_ASSET_BASE, falling back to the project's own
   Supabase URL. The companion only ever faces left/right on the desktop, so
   only the pack's RIGHT-facing frames are used; LEFT is a CSS scaleX(-1).
   ========================================================================== */
import { publicEnv } from "@/lib/env";

export const COMPANIONS = [
  "ninja-green",
  "ninja-red",
  "ninja-grey",
  "scout",
  "villager",
  "wanderer",
  "ember",
  "knight",
  "sentinel",
  "crimson",
] as const;
export type CompanionName = (typeof COMPANIONS)[number];

export type CompanionAnim = "idle" | "walk" | "cheer" | "sit";

export const FRAME_PX = 80;

/** frame count + playback rate per animation strip */
export const COMPANION_ANIMS: Record<CompanionAnim, { frames: number; fps: number }> = {
  idle: { frames: 1, fps: 1 },
  walk: { frames: 4, fps: 7 },
  cheer: { frames: 2, fps: 5 },
  sit: { frames: 1, fps: 1 },
};

export function shopAssetBase(): string {
  const explicit = process.env.NEXT_PUBLIC_SHOP_ASSET_BASE;
  if (explicit) return explicit.replace(/\/$/, "");
  const url = publicEnv.supabaseUrl.replace(/\/$/, "");
  return url ? `${url}/storage/v1/object/public/shop-assets` : "";
}

export function companionSheetUrl(name: string, anim: CompanionAnim): string {
  return `${shopAssetBase()}/companions/${name}/${anim}.png`;
}

export function isCompanionName(v: string | null | undefined): v is CompanionName {
  return !!v && (COMPANIONS as readonly string[]).includes(v);
}

/** display label for a companion key */
export function companionLabel(name: string): string {
  return name
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}
