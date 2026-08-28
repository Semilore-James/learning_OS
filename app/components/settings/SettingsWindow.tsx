"use client";

/* ============================================================================
   Settings — appearance (theme, skin, wallpaper), profile (display name), and
   data (export a JSON snapshot, reset all learning progress). Everything here
   persists through the store adapter.
   ========================================================================== */
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SKINS } from "@/lib/skins";
import { WALLPAPERS } from "@/components/wallpaper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Skin, Theme } from "@/lib/store/types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

export function SettingsWindow() {
  const { state, dispatch } = useStore();
  const { theme, skin, wallpaperId, reduceEffects, displayName } = state.profile;
  const [name, setName] = useState(displayName ?? "");
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `da-os-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="w-[420px] max-w-full">
      <section className="flex flex-col gap-2 border-b border-border p-5">
        <SectionLabel>Display name</SectionLabel>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Shown on the taskbar and your share page"
            maxLength={40}
          />
          <Button
            variant="outline"
            disabled={name.trim() === (displayName ?? "").trim()}
            onClick={() => dispatch({ type: "setDisplayName", displayName: name.trim() })}
          >
            Save
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-border p-5">
        <SectionLabel>Theme</SectionLabel>
        <div className="flex gap-2">
          {(["dark", "light"] as Theme[]).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "outline"}
              className="flex-1 capitalize"
              onClick={() => dispatch({ type: "setTheme", theme: t })}
            >
              {t}
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 border-b border-border p-5">
        <SectionLabel>Design language</SectionLabel>
        {SKINS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => dispatch({ type: "setSkin", skin: s.id as Skin })}
            className={cn(
              "flex flex-col gap-1 rounded-[var(--radius-control)] border p-3 text-left",
              skin === s.id ? "chrome-flat bg-surface-raised" : "border-border",
            )}
          >
            <span className="text-xs font-semibold text-foreground">
              {s.label}
              {skin === s.id && (
                <span className="ml-2 font-mono text-[9px] text-primary">ACTIVE</span>
              )}
            </span>
            <span className="text-[11px] font-light text-muted-foreground">{s.blurb}</span>
          </button>
        ))}
      </section>

      <section className="flex items-center justify-between gap-4 border-b border-border p-5">
        <div className="flex flex-col gap-1">
          <SectionLabel>Reduce celebration effects</SectionLabel>
          <span className="text-[11px] font-light text-muted-foreground">
            Turns off particle bursts, count-ups, and pulses. The wallpaper is unaffected.
          </span>
        </div>
        <Switch
          checked={reduceEffects}
          onCheckedChange={(v) => dispatch({ type: "setReduceEffects", reduceEffects: v })}
        />
      </section>

      <section className="flex flex-col gap-3 p-5">
        <SectionLabel>Wallpaper</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              title={w.blurb}
              onClick={() => dispatch({ type: "setWallpaper", wallpaperId: w.id })}
              className={cn(
                "relative flex aspect-[16/10] items-end overflow-hidden rounded-[var(--radius-control)] border bg-surface-raised p-0",
                wallpaperId === w.id ? "border-2 border-primary" : "border-border",
              )}
            >
              {w.kind === "svg" && w.Component && (
                <div className="pointer-events-none absolute inset-0">
                  <w.Component theme={theme} reducedMotion />
                </div>
              )}
              <span
                className="relative w-full px-1.5 py-[3px] font-mono text-[9px] text-foreground"
                style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
              >
                {w.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] font-light text-muted-foreground">
          More wallpapers, including your own art, drop into the same picker later.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border p-5">
        <SectionLabel>Data</SectionLabel>
        <Button variant="outline" onClick={exportData}>
          Export my progress (JSON)
        </Button>
        {confirmReset ? (
          <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-[#e5484d] p-3">
            <span className="text-[11px] text-foreground">
              This wipes every node, streak, review card, game score, and log. Appearance and
              display name stay. This cannot be undone.
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#e5484d] text-white hover:bg-[#e5484d]/90"
                onClick={() => {
                  dispatch({ type: "resetProgress" });
                  setConfirmReset(false);
                }}
              >
                Erase everything
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="text-[#e5484d]"
            onClick={() => setConfirmReset(true)}
          >
            Reset all progress
          </Button>
        )}
      </section>
    </div>
  );
}
