/* ============================================================================
   Desktop companion sprite metadata.

   The sheets are horizontal strips of 96×96 frames, one PNG per animation,
   served from the Supabase Storage bucket "shop-assets" (public read) at
     <base>/companions/<name>/<anim>.png
   base = NEXT_PUBLIC_SHOP_ASSET_BASE, falling back to the project's own
   Supabase URL + the public-object path. Source art: "Free Medieval Bandit"
   pack (Right-facing frames only; Left is a CSS scaleX(-1)).
   ========================================================================== */
import { publicEnv } from "@/lib/env";

export const COMPANIONS = ["assassin", "robber", "thug"] as const;
export type CompanionName = (typeof COMPANIONS)[number];

export type CompanionAnim = "idle" | "idle-blinking" | "walking" | "running";

export const FRAME_PX = 96;

/** frame count + playback rate per animation strip */
export const COMPANION_ANIMS: Record<CompanionAnim, { frames: number; fps: number }> = {
  idle: { frames: 16, fps: 9 },
  "idle-blinking": { frames: 16, fps: 9 },
  walking: { frames: 20, fps: 14 },
  running: { frames: 12, fps: 16 },
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
