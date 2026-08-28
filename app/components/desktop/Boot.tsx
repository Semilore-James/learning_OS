"use client";

import { useEffect, useState } from "react";

const LINES = [
  "DA // LEARNING OS  v0.1",
  "mounting token system ......... ok",
  "restoring profile ............. ok",
  "loading curriculum graph ...... ok",
  "hydrating progress ............ ok",
  "initialising desktop .........",
];

export function Boot({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= LINES.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v + 1), 230);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-center gap-1.5 px-[12vw] font-mono text-[13px] leading-[1.7] text-brand-green" style={{ background: "var(--bg)" }}>
      {LINES.slice(0, n).map((l, i) => (
        <div key={i} style={{ animation: "bootline .2s ease" }}>
          <span className="text-muted-foreground">&gt;</span> {l}
        </div>
      ))}
      <div className="mt-4 h-[3px] w-full max-w-[420px] bg-surface-raised">
        <div
          className="h-full bg-primary transition-[width] duration-200"
          style={{ width: `${Math.min(100, (n / LINES.length) * 100)}%` }}
        />
      </div>
    </div>
  );
}
