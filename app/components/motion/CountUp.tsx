"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

/** Rolls from the previous value to the next when `value` changes.
 *  Renders `value` directly when motion is off or between animations. */
export function CountUp({
  value,
  className,
  format = (n) => Math.round(n).toLocaleString(),
  duration = 0.5,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
  duration?: number;
}) {
  const allowed = useMotionAllowed();
  const [animated, setAnimated] = useState<number | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value || !allowed) return;
    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setAnimated(v),
      onComplete: () => setAnimated(null),
    });
    return () => controls.stop();
  }, [value, allowed, duration]);

  return <span className={className}>{format(allowed && animated != null ? animated : value)}</span>;
}
