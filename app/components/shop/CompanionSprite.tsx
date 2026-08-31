"use client";

/* ============================================================================
   One companion animation strip, played with a pure-CSS steps() animation (no
   JS frame timer). Shared by the Shop card preview and the live
   DesktopCompanion.

   Strips are horizontal, 80px frames. The keyframe `companion-play` (globals.css)
   translates the inner track by -100% (its full width); steps(<frames>) walks it
   one frame at a time. Left-facing is a CSS scaleX(-1).
   ========================================================================== */
import { useEffect, useRef } from "react";
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
  const url = companionSheetUrl(name, anim);
  const animate = frames > 1 && !paused;
  const durationS = frames / fps;

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
      <div
        // key on anim so React swaps the node and the animation restarts clean
        key={anim}
        style={{
          width: frames * size,
          height: size,
          backgroundImage: `url(${url})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          animation: animate
            ? `companion-play ${durationS}s steps(${frames}) infinite`
            : "none",
          transform: animate ? undefined : "translateX(0)",
        }}
      />
    </div>
  );
}
