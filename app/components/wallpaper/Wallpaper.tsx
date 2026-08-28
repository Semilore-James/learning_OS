"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WALLPAPER_ID, type Theme } from "./types";
import { WALLPAPERS_BY_ID } from "./registry";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function Wallpaper({
  id,
  theme,
}: {
  id: string | undefined;
  theme: Theme;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const def = WALLPAPERS_BY_ID[id ?? DEFAULT_WALLPAPER_ID] ?? WALLPAPERS_BY_ID[DEFAULT_WALLPAPER_ID];

  const layer = {
    position: "absolute" as const,
    inset: 0,
    zIndex: 0,
    overflow: "hidden" as const,
    // the layer itself is transparent to the cursor; individual .wp-dot
    // circles opt back in so hovering empty desktop still reaches them
    pointerEvents: "none" as const,
  };

  if (def.kind === "image" && def.src) {
    const url = theme === "light" ? (def.src.light ?? def.src.dark) : def.src.dark;
    return (
      <div
        style={{
          ...layer,
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
    );
  }

  const C = def.Component!;
  return (
    <div style={layer} aria-hidden>
      <C theme={theme} reducedMotion={reducedMotion} />
    </div>
  );
}
