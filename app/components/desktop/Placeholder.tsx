/* Shown inside a window whose feature is not built yet. During the build these
   windows are reachable in dev; in production the flag hides the icon until the
   feature ships. Not a shipped stub — a build-status panel. */
export function Placeholder({ feature, step }: { feature: string; step: string }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 32,
        textAlign: "center",
      }}
    >
      <div style={{ font: "600 15px var(--font-display)", color: "var(--text)" }}>
        {feature}
      </div>
      <div style={{ font: "400 12px var(--font-body)", color: "var(--muted)", maxWidth: 360 }}>
        Under construction. Tracked as {step} in the build plan. The window
        chrome, theming, and state layer it plugs into are already live.
      </div>
      <div
        style={{
          marginTop: 6,
          padding: "4px 10px",
          border: "var(--bd-inner)",
          borderRadius: "var(--radius-control)",
          font: "400 10px var(--font-mono)",
          color: "var(--muted)",
        }}
      >
        {step}
      </div>
    </div>
  );
}
