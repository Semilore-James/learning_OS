"use client";

import { motion } from "motion/react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

/** Fade + small slide-in on mount. Instant when motion is off. */
export function Reveal({
  children,
  className,
  y = 8,
  duration = 0.16,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
}) {
  const allowed = useMotionAllowed();
  if (!allowed) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
