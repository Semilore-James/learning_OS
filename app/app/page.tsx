import { Wallpaper } from "@/components/wallpaper";

/**
 * Placeholder root. The real desktop shell (icon grid, taskbar, window
 * manager) lands in Phase 0 step 8. For now: proves tokens, fonts, and the
 * wallpaper engine. Visit /wallpapers to see the full set in both themes.
 */
export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <Wallpaper id="starfield" theme="dark" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
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
        <a
          href="/wallpapers"
          style={{ font: "400 12px var(--font-mono)", color: "var(--primary)" }}
        >
          view wallpapers &rarr;
        </a>
      </div>
    </main>
  );
}
