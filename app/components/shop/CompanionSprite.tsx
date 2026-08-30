"use client";

/* ============================================================================
   One companion animation strip, played frame by frame. Shared by the Shop
   card preview (idle loop) and the live DesktopCompanion.

   Strips are horizontal, 96px frames, served from the shop-assets bucket.
   Left-facing is a CSS flip of the Right-facing art.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import {
  COMPANION_ANIMS,
  FRAME_PX,
  companionSheetUrl,
  type CompanionAnim,
} from "@/lib/shop/companions";

export function CompanionSprite({
  name,
  anim,
  size = FRAME_PX,
  flip = false,
  paused = false,
  className,
}: {
  name: string;
  anim: CompanionAnim;
  size?: number;
  flip?: boolean;
  paused?: boolean;
  className?: string;
}) {
  const { frames, fps } = COMPANION_ANIMS[anim];
  const [tick, setTick] = useState(0);
  const url = companionSheetUrl(name, anim);

  // one monotonic counter; the displayed frame is tick % frames, so switching
  // animations (which changes `frames`) needs no explicit reset
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), Math.max(30, 1000 / fps));
    return () => window.clearInterval(id);
  }, [fps, paused]);

  const frame = tick % frames;

  // preload the other anims for this companion so switching doesn't flash
  const preloaded = useRef<string | null>(null);
  useEffect(() => {
    if (preloaded.current === name) return;
    preloaded.current = name;
    (Object.keys(COMPANION_ANIMS) as CompanionAnim[]).forEach((a) => {
      const img = new Image();
      img.src = companionSheetUrl(name, a);
    });
  }, [name]);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        style={{
          width: frames * size,
          height: size,
          maxWidth: "none",
          transform: `translateX(${-frame * size}px)`,
          userSelect: "none",
        }}
      />
    </div>
  );
}
