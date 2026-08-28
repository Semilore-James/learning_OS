/* Shown inside a window whose feature is not built yet. During the build these
   windows are reachable in dev; in production the flag hides the icon until the
   feature ships. Not a shipped stub — a build-status panel. */
export function Placeholder({ feature, step }: { feature: string; step: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 p-8 text-center">
      <div className="font-display text-[15px] font-semibold text-foreground">{feature}</div>
      <p className="max-w-[360px] text-xs text-muted-foreground">
        Under construction. Tracked as {step} in the build plan. The window chrome, theming, and state
        layer it plugs into are already live.
      </p>
      <div className="chrome-flat mt-1.5 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
        {step}
      </div>
    </div>
  );
}
