"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallpaper } from "@/components/wallpaper";
import { Window } from "@/components/window/Window";
import { useStore } from "@/lib/store";
import { useWindows } from "@/lib/useWindows";
import { ALL_APPS } from "@/lib/appRegistry";
import { ChromeController } from "./ChromeController";
import { Boot } from "./Boot";
import { IconGrid } from "./IconGrid";
import { Taskbar } from "./Taskbar";

const BOOT_KEY = "da-os-booted";

export function Desktop() {
  const { state } = useStore();
  const wm = useWindows();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY) === "1") setBooted(true);
    } catch {
      /* ignore */
    }
  }, []);

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
    setBooted(true);
  }, []);

  const ready = state.ready;

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
      <ChromeController />
      <Wallpaper id={state.profile.wallpaperId} theme={state.profile.theme} />

      {(!ready || !booted) && <Boot onDone={finishBoot} />}

      {ready && booted && (
        <>
          <IconGrid openIds={wm.open} onOpen={wm.openWindow} />

          {wm.open.map((id) => {
            const app = ALL_APPS[id];
            if (!app) return null;
            const pos = wm.posOf(id) ?? { x: 200, y: 80 };
            const { Body } = app;
            return (
              <Window
                key={id}
                id={id}
                title={app.win.title}
                subtitle={app.win.subtitle}
                x={pos.x}
                y={pos.y}
                z={wm.zOf(id)}
                width={app.win.width}
                height={app.win.height}
                onClose={() => wm.closeWindow(id)}
                onFocus={() => wm.focusWindow(id)}
                onDragStart={(e) => wm.startDrag(id, e)}
              >
                <Body />
              </Window>
            );
          })}

          {state.mode === "guest" && (
            <div
              style={{
                position: "absolute",
                bottom: 52,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "6px 14px",
                background: "var(--surface-raised)",
                border: "var(--bd-inner)",
                borderRadius: "var(--radius-control)",
                font: "400 11px var(--font-mono)",
                color: "var(--muted)",
                zIndex: 150,
              }}
            >
              Guest mode. Progress saves to this browser only.
            </div>
          )}

          <Taskbar onOpenSettings={() => wm.openWindow("settings")} />
        </>
      )}
    </main>
  );
}
