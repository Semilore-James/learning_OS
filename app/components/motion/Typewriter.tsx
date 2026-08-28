"use client";

import { useEffect, useState } from "react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

/** Reveals `text` at roughly `cps` characters per second. Instant when motion
 *  is off. Parent should key it by the text so a new message restarts cleanly.
 *  Used for PM-AI replies (step 17). */
export function Typewriter({
  text,
  className,
  cps = 42,
}: {
  text: string;
  className?: string;
  cps?: number;
}) {
  const allowed = useMotionAllowed();
  const [len, setLen] = useState(() => (allowed ? 0 : text.length));

  useEffect(() => {
    if (!allowed) return;
    const step = Math.max(1, Math.round(cps / 20));
    const id = window.setInterval(() => {
      setLen((l) => {
        if (l >= text.length) {
          window.clearInterval(id);
          return l;
        }
        return Math.min(text.length, l + step);
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [allowed, text, cps]);

  return <span className={className}>{text.slice(0, len)}</span>;
}
