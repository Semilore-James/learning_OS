/**
 * Placeholder root. The real desktop shell (wallpaper engine, icon grid,
 * taskbar, window manager) lands in Phase 0 step 8. For now this just proves
 * the token system and fonts load.
 */
export default function Home() {
  return (
    <main
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          font: "700 24px/1 var(--font-mono)",
          color: "var(--primary)",
          letterSpacing: "-0.5px",
        }}
      >
        DA // LEARNING OS
      </div>
      <div style={{ font: "300 13px var(--font-body)", color: "var(--muted)" }}>
        Foundation scaffold. Desktop shell coming in Phase 0.
      </div>
    </main>
  );
}
