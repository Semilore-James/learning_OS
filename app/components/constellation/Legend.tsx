"use client";

import { useEffect, useState } from "react";

const ROWS: [string, string, boolean][] = [
  ["Completed", "var(--accent-2)", true],
  ["Active", "var(--primary)", true],
  ["Needs review", "var(--accent-1)", true],
  ["Available", "var(--accent-3)", false],
  ["Locked", "var(--border)", false],
];

const AUTO_COLLAPSE_MS = 4500;

/** Opens on mount, auto-collapses to a small "i" badge after a few seconds.
 *  Hover to peek; click the badge to pin it open (which restarts the
 *  auto-collapse timer, so it always ends up as the badge again). */
export function Legend() {
  const [open, setOpen] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), AUTO_COLLAPSE_MS);
    return () => clearTimeout(t);
  }, [open]);

  const expanded = open || hover;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "absolute", top: 12, right: 12, zIndex: 3 }}
    >
      {expanded ? (
        <div
          onClick={() => setOpen((o) => !o)}
          style={{
            background: "var(--surface)",
            border: "var(--bd-inner)",
            boxShadow: "var(--shadow-xs)",
            borderRadius: "var(--radius)",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            cursor: "pointer",
            animation: "fadeIn .16s ease",
          }}
        >
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
        <button
          type="button"
          aria-label="Show legend"
          title="Legend"
          onClick={() => setOpen(true)}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "var(--surface)",
            border: "var(--bd-inner)",
            boxShadow: "var(--shadow-xs)",
            color: "var(--muted-foreground)",
            font: "italic 700 12px var(--font-label)",
            cursor: "pointer",
          }}
        >
          i
        </button>
      )}
    </div>
  );
}
