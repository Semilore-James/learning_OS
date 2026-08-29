"use client";

/* ============================================================================
   ParticleButton — the ONE commitment button (council decision). Inherits the
   skin via shadcn <Button>; emits a short particle spray from the click point.
   No particles when motion is off. Use it only for "Mark as complete" and
   "Submit to PM-AI".
   ========================================================================== */
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
  dist: number;
  size: number;
}

export function ParticleButton({
  children,
  onClick,
  className,
  variant = "default",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
}) {
  const allowed = useMotionAllowed();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const seq = useRef(0);

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (allowed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const batch: Spark[] = Array.from({ length: 18 }, (_, i) => ({
        id: seq.current++,
        x,
        y,
        angle: (i / 18) * Math.PI * 2 + Math.random() * 0.4,
        dist: 24 + Math.random() * 40,
        size: 2 + Math.random() * 3,
      }));
      setSparks((s) => [...s, ...batch]);
      window.setTimeout(() => setSparks((s) => s.filter((x) => !batch.some((b) => b.id === x.id))), 700);
    }
    onClick?.();
  };

  return (
    <Button
      variant={variant}
      disabled={disabled}
      className={`relative overflow-visible ${className ?? ""}`}
      onClick={handle}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {sparks.map((sp) => (
          <motion.span
            key={sp.id}
            className="pointer-events-none absolute rounded-full bg-white"
            style={{ left: sp.x, top: sp.y, width: sp.size, height: sp.size }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(sp.angle) * sp.dist, y: Math.sin(sp.angle) * sp.dist, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </Button>
  );
}
