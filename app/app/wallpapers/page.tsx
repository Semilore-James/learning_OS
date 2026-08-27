import { Wallpaper, WALLPAPERS } from "@/components/wallpaper";

/**
 * Dev preview of every wallpaper in both themes. Not linked from the shell;
 * this is a scratch page for eyeballing the set and dropping in custom art.
 */
export default function WallpapersPreview() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        overflow: "auto",
        background: "#0b0b0b",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 20,
        fontFamily: "var(--font-mono)",
      }}
    >
      {WALLPAPERS.flatMap((w) =>
        (["dark", "light"] as const).map((theme) => (
          <div key={`${w.id}-${theme}`}>
            <div
              data-theme={theme}
              style={{
                position: "relative",
                aspectRatio: "16 / 10",
                border: "3px solid #000",
                boxShadow: "6px 6px 0 #000",
                overflow: "hidden",
                background: "var(--bg)",
              }}
            >
              <Wallpaper id={w.id} theme={theme} />
            </div>
            <div style={{ marginTop: 8, color: "#e8ecf4", fontSize: 12 }}>
              <strong>{w.label}</strong>{" "}
              <span style={{ color: "#63718c" }}>/ {theme}</span>
              <div style={{ color: "#63718c", fontSize: 11, marginTop: 2 }}>
                {w.blurb}
              </div>
            </div>
          </div>
        )),
      )}
    </main>
  );
}
