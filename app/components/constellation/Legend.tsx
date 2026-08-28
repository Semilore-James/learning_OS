"use client";

import { useEffect, useRef, useState } from "react";

const ROWS: [string, string, boolean][] = [
  ["Completed", "var(--accent-2)", true],
  ["Active", "var(--primary)", true],
  ["Needs review", "var(--accent-1)", true],
  ["Available", "var(--accent-3)", false],
  ["Locked", "var(--border)", false],
];

/** Opens on mount, auto-collapses to a small chip after a few seconds. Hover or
 *  click the chip to bring it back. */
export function Legend() {
  const [open, setOpen] = useState(true);
  const [hover, setHover] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setOpen(false), 4500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const expanded = open || hover;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (timer.current) clearTimeout(timer.current);
        setOpen((o) => !o);
      }}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        background: "var(--surface)",
        border: "var(--bd-inner)",
        boxShadow: "var(--shadow-xs)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "max-height .28s ease, padding .28s ease, opacity .2s ease",
        maxHeight: expanded ? 200 : 26,
        padding: expanded ? "10px 12px" : "5px 10px",
        opacity: expanded ? 1 : 0.7,
      }}
      title="Legend"
    >
      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {ROWS.map(([label, color, filled]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: filled ? color : "transparent",
                  border: filled ? "none" : `1.5px solid ${color}`,
                }}
              />
              <span style={{ font: "500 10px var(--font-label)", color: "var(--text)" }}>{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ font: "600 9px var(--font-label)", letterSpacing: "0.1em", color: "var(--muted)" }}>
          LEGEND
        </span>
      )}
    </div>
  );
}
