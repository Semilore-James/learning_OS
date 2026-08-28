"use client";

import { APPS } from "@/lib/appRegistry";
import { flag } from "@/lib/flags";

export function IconGrid({
  openIds,
  onOpen,
}: {
  openIds: string[];
  onOpen: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "grid",
        gridTemplateColumns: "repeat(2, 84px)",
        gap: 16,
        zIndex: 5,
      }}
    >
      {APPS.filter((a) => !a.flag || flag(a.flag)).map((a) => {
        const isOpen = openIds.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            title={`${a.hint} — double-click to open`}
            onDoubleClick={() => onOpen(a.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(a.id);
            }}
            style={{
              width: 84,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isOpen ? "var(--primary)" : "var(--muted-foreground)",
              padding: 0,
              userSelect: "none",
            }}
          >
            <span
              style={{
                width: 76,
                height: 76,
                display: "grid",
                placeItems: "center",
                background: "var(--tile-bg)",
                border: isOpen ? "var(--bd-width) solid var(--primary)" : "var(--bd)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {a.glyph}
            </span>
            <span
              style={{
                font: "400 10px/1.2 var(--font-mono)",
                color: "var(--muted-foreground)",
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {a.label}
            </span>
            {isOpen && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  marginTop: -2,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
