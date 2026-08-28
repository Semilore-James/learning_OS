"use client";

/* ============================================================================
   Settings — theme (colour palette), skin (design language), wallpaper.
   All three persist to the profile via the store, so a logged-in user keeps
   them across devices and a guest keeps them in localStorage.
   The full Settings window (data export, reset progress, profile) lands in
   Phase 1 step 21; this is the appearance section, built now on request.
   ========================================================================== */
import { useStore } from "@/lib/store";
import { SKINS } from "@/lib/skins";
import { WALLPAPERS } from "@/components/wallpaper";
import type { Skin, Theme } from "@/lib/store/types";

const section: React.CSSProperties = {
  padding: "18px 20px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};
const label: React.CSSProperties = {
  font: "700 9px var(--font-mono)",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

export function SettingsWindow() {
  const { state, dispatch } = useStore();
  const { theme, skin, wallpaperId } = state.profile;

  return (
    <div>
      {/* THEME ---------------------------------------------------------- */}
      <div style={section}>
        <span style={label}>Theme</span>
        <div style={{ display: "flex", gap: 8 }}>
          {(["dark", "light"] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => dispatch({ type: "setTheme", theme: t })}
              style={{
                flex: 1,
                padding: "10px 0",
                textTransform: "capitalize",
                font: "600 12px var(--font-display)",
                color: theme === t ? "#fff" : "var(--text)",
                background: theme === t ? "var(--primary)" : "var(--surface-raised)",
                border: "var(--bd-inner)",
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SKIN --------------------------------------------------------- */}
      <div style={section}>
        <span style={label}>Design language</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SKINS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => dispatch({ type: "setSkin", skin: s.id as Skin })}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background: skin === s.id ? "var(--surface-raised)" : "transparent",
                border: skin === s.id ? "var(--bd-inner)" : "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span style={{ font: "600 12px var(--font-display)", color: "var(--text)" }}>
                {s.label}
                {skin === s.id && (
                  <span style={{ color: "var(--primary)", marginLeft: 8, font: "400 9px var(--font-mono)" }}>
                    ACTIVE
                  </span>
                )}
              </span>
              <span style={{ font: "300 11px var(--font-body)", color: "var(--muted)" }}>
                {s.blurb}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WALLPAPER -------------------------------------------------- */}
      <div style={{ ...section, borderBottom: "none" }}>
        <span style={label}>Wallpaper</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              title={w.blurb}
              onClick={() => dispatch({ type: "setWallpaper", wallpaperId: w.id })}
              style={{
                aspectRatio: "16 / 10",
                position: "relative",
                overflow: "hidden",
                background: "var(--surface-raised)",
                border: wallpaperId === w.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-end",
                padding: 0,
              }}
            >
              {w.kind === "svg" && w.Component && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <w.Component theme={theme} reducedMotion />
                </div>
              )}
              <span
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "3px 6px",
                  font: "400 9px var(--font-mono)",
                  color: "var(--text)",
                  background: "color-mix(in srgb, var(--bg) 70%, transparent)",
                }}
              >
                {w.label}
              </span>
            </button>
          ))}
        </div>
        <p style={{ font: "300 11px var(--font-body)", color: "var(--muted)", margin: 0 }}>
          More wallpapers, including your own art, drop into the same picker later.
        </p>
      </div>
    </div>
  );
}
