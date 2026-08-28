"use client";

import { useEffect, useState } from "react";
import { useStore, select } from "@/lib/store";

function useClock() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setT(
        `${n.getHours().toString().padStart(2, "0")}:${n
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function Taskbar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state, dispatch, syncing } = useStore();
  const clock = useClock();
  const { current: streak } = select.streak(state);
  const xp = state.xpTotal;
  const xpInLevel = xp % 1000;
  const nextTheme = state.profile.theme === "dark" ? "light" : "dark";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "var(--surface)",
        borderTop: "var(--bd)",
        zIndex: 200,
      }}
    >
      <div style={{ font: "700 13px var(--font-mono)", color: "var(--primary)", letterSpacing: "-0.3px" }}>
        DA // OS
      </div>

      <div style={{ font: "400 13px var(--font-mono)", color: "var(--text)" }}>{clock}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {syncing && (
          <span style={{ font: "400 9px var(--font-mono)", color: "var(--muted)" }}>saving…</span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ font: "700 11px var(--font-display)", color: "var(--accent-1)" }}>
            {xp.toLocaleString()} XP
          </span>
          <span style={{ width: 60, height: 4, background: "var(--surface-raised)", display: "block" }}>
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${(xpInLevel / 1000) * 100}%`,
                background: "var(--accent-1)",
              }}
            />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, font: "700 11px var(--font-display)", color: "var(--accent-1)" }}>
          🔥 {streak}
        </div>
        <button
          type="button"
          aria-label={`Switch to ${nextTheme} theme`}
          onClick={() => dispatch({ type: "setTheme", theme: nextTheme })}
          style={{
            width: 30,
            height: 30,
            display: "grid",
            placeItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: "var(--text)",
          }}
        >
          {state.profile.theme === "dark" ? "☾" : "☀"}
        </button>
        <button
          type="button"
          aria-label="Open settings"
          onClick={onOpenSettings}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--accent-3)",
            border: "var(--bd-inner)",
            color: "#fff",
            font: "700 10px var(--font-display)",
            cursor: "pointer",
          }}
        >
          {(state.profile.displayName?.[0] ?? "A").toUpperCase()}
        </button>
      </div>
    </div>
  );
}
