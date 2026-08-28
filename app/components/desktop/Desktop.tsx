"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Wallpaper } from "@/components/wallpaper";
import { Window } from "@/components/window/Window";
import { useStore } from "@/lib/store";
import { useWindows } from "@/lib/useWindows";
import { resolveApp } from "@/lib/appRegistry";
import { WindowActionsProvider } from "@/lib/windowContext";
import { ChromeController } from "./ChromeController";
import { Boot } from "./Boot";
import { IconGrid } from "./IconGrid";
import { Taskbar } from "./Taskbar";

const BOOT_KEY = "da-os-booted";

export function Desktop() {
  const { state } = useStore();
  const wm = useWindows();

  // whether the boot sequence already played this browser session
  const persistedBoot = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(BOOT_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [localBoot, setLocalBoot] = useState(false);
  const booted = persistedBoot || localBoot;

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
    setLocalBoot(true);
  }, []);

  const ready = state.ready;

  // always open a window at its registered default size, so resize math starts
  // from the size actually on screen
  const openApp = useCallback(
    (id: string, size?: { width: number; height: number }) => {
      wm.openWindow(id, size ?? resolveApp(id)?.win);
    },
    [wm],
  );

  const winActions = useMemo(
    () => ({ open: openApp, close: wm.closeWindow, focus: wm.focusWindow }),
    [openApp, wm.closeWindow, wm.focusWindow],
  );

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
        <WindowActionsProvider value={winActions}>
          <IconGrid openIds={wm.open} onOpen={openApp} />

          {wm.open.map((id) => {
            const app = resolveApp(id);
            if (!app || wm.isMinimized(id)) return null;
            const pos = wm.posOf(id) ?? { x: 200, y: 80 };
            const size = wm.sizeOf(id) ?? app.win;
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
                width={size.width}
                height={size.height}
                maximized={wm.isMaximized(id)}
                onClose={() => wm.closeWindow(id)}
                onFocus={() => wm.focusWindow(id)}
                onMinimize={() => wm.toggleMinimize(id)}
                onMaximize={() => wm.toggleMaximize(id)}
                onDragStart={(e) => wm.startDrag(id, e)}
                onResizeStart={(edge, e) => wm.startResize(id, edge, e)}
                fitContent={app.fitContent}
                onReportNatural={wm.reportNatural.bind(null, id)}
              >
                <Body />
              </Window>
            );
          })}

          {wm.minimized.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 52,
                display: "flex",
                gap: 6,
                zIndex: 150,
              }}
            >
              {wm.minimized.map((id) => {
                const app = resolveApp(id);
                if (!app) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openApp(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 10px",
                      background: "var(--surface-raised)",
                      border: "var(--bd-inner)",
                      borderRadius: "var(--radius-control)",
                      font: "600 11px var(--font-display)",
                      color: "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                    {app.win.title}
                  </button>
                );
              })}
            </div>
          )}

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
                color: "var(--muted-foreground)",
                zIndex: 150,
              }}
            >
              Guest mode. Progress saves to this browser only.
            </div>
          )}

          <Taskbar onOpenSettings={() => openApp("settings")} />
        </WindowActionsProvider>
      )}
    </main>
  );
}
