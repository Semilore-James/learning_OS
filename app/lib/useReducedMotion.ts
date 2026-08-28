"use client";

import { useEffect, useState } from "react";

/** true when the OS "reduce motion" setting is on. Ambient animation should
 *  freeze; see globals.css for the CSS-level fallback. */
export function useReducedMotion(): boolean {
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
