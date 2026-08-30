"use client";

/* ============================================================================
   Renders an app's icon, swapping in the equipped icon set (state.equipped
   .iconSet) when one covers this app id. Falls back to the app's built-in
   lucide-style glyph when the set is null or has no mapping for the id.
   ========================================================================== */
import type { ReactNode } from "react";
import { useStore, select } from "@/lib/store";
import { iconSrc } from "@/lib/shop/iconSets";

export function AppGlyph({
  appId,
  glyph,
  size = 40,
}: {
  appId: string;
  glyph: ReactNode;
  size?: number;
}) {
  const iconSet = select.equippedIconSet(useStore().state);
  const src = iconSrc(appId, iconSet);
  if (!src) return <>{glyph}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}
