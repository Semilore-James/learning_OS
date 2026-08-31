"use client";

/* ============================================================================
   One companion animation strip, played with a pure-CSS steps() animation (no
   JS frame timer). Shared by the Shop card preview and the live
   DesktopCompanion.

   The element is always size x size. The strip is set as an over-wide
   background (`backgroundSize` = frames*size) and `background-position-x` is
   stepped one frame at a time by the `companion-a2` / `companion-a4` keyframes
   (globals.css). Because the node, its size, and its transform never change
   between animations, switching anim (e.g. walk -> idle when the companion
   stops) is a plain in-place style update with no remount and no snap.
   Left-facing is a CSS scaleX(-1).
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
  const stripW = frames * size;
  // distinct keyframe name per frame count -> changing anim restarts the
  // animation cleanly instead of retiming a running one
  const keyframe = frames === 4 ? "companion-a4" : frames === 2 ? "companion-a2" : "";

  // preload every anim for this companion so switching never flashes
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
        style={
          {
            width: size,
            height: size,
            backgroundImage: `url(${url})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${stripW}px ${size}px`,
            backgroundPositionX: 0,
            imageRendering: "pixelated",
            "--cg-end": `-${stripW}px`,
            animation:
              animate && keyframe
                ? `${keyframe} ${durationS}s steps(${frames}) infinite`
                : "none",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
