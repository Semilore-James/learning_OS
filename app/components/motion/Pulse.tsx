"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

/** One-shot scale bump whenever `trigger` changes to a new value. */
export function Pulse({
  trigger,
  children,
  className,
  scale = 1.35,
}: {
  trigger: unknown;
  children: React.ReactNode;
  className?: string;
  scale?: number;
}) {
  const allowed = useMotionAllowed();
  const controls = useAnimationControls();
  const prev = useRef(trigger);

  useEffect(() => {
    if (prev.current === trigger) return;
    prev.current = trigger;
    if (!allowed) return;
    controls.start({ scale: [1, scale, 1], transition: { duration: 0.42, ease: "easeOut" } });
  }, [trigger, allowed, scale, controls]);

  return (
    <motion.span className={className} animate={controls} style={{ display: "inline-flex" }}>
      {children}
    </motion.span>
  );
}
