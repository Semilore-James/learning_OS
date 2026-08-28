"use client";

/* ============================================================================
   Burst — a one-shot particle burst fired imperatively via a ref. Used only
   on node-complete and case-complete (council decision). `intensity` (0..1)
   scales particle count + spread so the 40th completion is quieter than the
   1st. When motion is off it renders a single scale-fade ring instead.
   ========================================================================== */
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

export interface BurstHandle {
  fire: (opts?: { intensity?: number; colors?: string[] }) => void;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const DEFAULT_COLORS = ["var(--accent-2)", "var(--primary)", "var(--accent-1)", "var(--accent-3)"];

export const Burst = forwardRef<BurstHandle>(function Burst(_props, ref) {
  const allowed = useMotionAllowed();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ring, setRing] = useState(0);
  const seq = useRef(0);

  useImperativeHandle(ref, () => ({
    fire(opts) {
      const intensity = Math.min(1, Math.max(0.15, opts?.intensity ?? 1));
      const colors = opts?.colors ?? DEFAULT_COLORS;
      if (!allowed) {
        setRing((r) => r + 1);
        return;
      }
      const count = Math.round(14 + intensity * 34);
      const batch: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: seq.current++,
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
        distance: (40 + Math.random() * 90) * (0.5 + intensity * 0.5),
        size: 3 + Math.random() * 4,
        color: colors[i % colors.length],
      }));
      setParticles((p) => [...p, ...batch]);
      window.setTimeout(() => {
        setParticles((p) => p.filter((x) => !batch.some((b) => b.id === x.id)));
      }, 900);
    },
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-50 grid place-items-center overflow-visible">
      <AnimatePresence>
        {ring > 0 && (
          <motion.span
            key={`ring-${ring}`}
            className="absolute rounded-full border-2"
            style={{ borderColor: "var(--accent-2)", width: 40, height: 40 }}
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      ))}
    </div>
  );
});
