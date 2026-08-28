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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        color: "var(--accent-2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 12vw",
        gap: 6,
        font: "400 13px/1.7 var(--font-mono)",
        zIndex: 9999,
      }}
    >
      {LINES.slice(0, n).map((l, i) => (
        <div key={i} style={{ animation: "bootline .2s ease" }}>
          <span style={{ color: "var(--muted)" }}>&gt;</span> {l}
        </div>
      ))}
      <div
        style={{
          marginTop: 18,
          height: 3,
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-raised)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, (n / LINES.length) * 100)}%`,
            background: "var(--primary)",
            transition: "width .2s ease",
          }}
        />
      </div>
    </div>
  );
}
