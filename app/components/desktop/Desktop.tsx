"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Wallpaper } from "@/components/wallpaper";
import { Window } from "@/components/window/Window";
import { useStore, select } from "@/lib/store";
import { useWindows } from "@/lib/useWindows";
import { resolveApp } from "@/lib/appRegistry";
import { WindowActionsProvider } from "@/lib/windowContext";
import { useSession } from "@/lib/session/SessionProvider";
import { flag } from "@/lib/flags";
import { track } from "@/lib/analytics";
import { ChromeController } from "./ChromeController";
import { Boot } from "./Boot";
import { IconGrid } from "./IconGrid";
import { Taskbar } from "./Taskbar";
import { CommandPalette } from "./CommandPalette";
import { SessionBriefing } from "./SessionBriefing";
import { DailyGreeting } from "./DailyGreeting";
import { Celebrations } from "./Celebrations";
import { DiagnosticScreen } from "./DiagnosticScreen";
import { OnboardingTour } from "./Onboarding";

const BOOT_KEY = "da-os-booted";

export function Desktop() {
  const { state } = useStore();
  const { phase, exitGuest } = useSession();
  const wm = useWindows();
  // dock icon the intro tour wants the learner to notice (null = none)
  const [tourPulse, setTourPulse] = useState<string | null>(null);

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

  const sessionLogged = useRef(false);
  useEffect(() => {
    if (!ready || !booted || sessionLogged.current) return;
    sessionLogged.current = true;
    track("session_start", {
      theme: state.profile.theme,
      current_node: select.activeNodeId(state),
      xp_total: state.xpTotal,
    });
  }, [ready, booted, state]);

  // always open a window at its registered default size, so resize math starts
  // from the size actually on screen
  const openApp = useCallback(
    (id: string, size?: { width: number; height: number }) => {
      if (!wm.open.includes(id)) {
        const label = resolveApp(id)?.win.title ?? id;
        track("module_opened", { module_name: label });
      }
      wm.openWindow(id, size ?? resolveApp(id)?.win);
    },
    [wm],
  );

  // dock icon: open if closed, focus if open-but-behind, minimize if it's the
  // front window. So a second double-click on the icon puts the window away.
  const activateFromDock = useCallback(
    (id: string) => {
      if (!wm.open.includes(id)) {
        openApp(id);
        return;
      }
      if (wm.isMinimized(id)) {
        wm.toggleMinimize(id);
        wm.focusWindow(id);
        return;
      }
      const front = wm.stack[wm.stack.length - 1];
      if (front === id) wm.toggleMinimize(id);
      else wm.focusWindow(id);
    },
    [wm, openApp],
  );

  const textbookTarget = useRef<string | undefined>(undefined);
  const winActions = useMemo(
    () => ({
      open: openApp,
      close: wm.closeWindow,
      focus: wm.focusWindow,
      openTextbook: (slug?: string) => {
        textbookTarget.current = slug;
        openApp("textbook");
      },
      consumeTextbookTarget: () => {
        const t = textbookTarget.current;
        textbookTarget.current = undefined;
        return t;
      },
    }),
    [openApp, wm.closeWindow, wm.focusWindow],
  );

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-background text-foreground">
      <ChromeController />
      <Wallpaper id={state.profile.wallpaperId} theme={state.profile.theme} />

      {(!ready || !booted) && <Boot onDone={finishBoot} />}

      {ready && booted && (
        <WindowActionsProvider value={winActions}>
          {flag("diagnostic") && state.profile.onboardingPhase === "mission" && (
            <OnboardingTour openIds={wm.open} onPulse={setTourPulse} />
          )}
          {flag("diagnostic") &&
            (state.profile.onboardingPhase === "calibration" ||
              state.profile.onboardingPhase === "orientation") && <DiagnosticScreen />}
          <IconGrid openIds={wm.open} onOpen={activateFromDock} pulseId={tourPulse} />

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
                maximized={wm.isMaximized(id) || wm.compact}
                compact={wm.compact}
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
            <div className="absolute bottom-[52px] left-4 z-[150] flex gap-1.5">
              {wm.minimized.map((id) => {
                const app = resolveApp(id);
                if (!app) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openApp(id)}
                    className="chrome-flat flex items-center gap-1.5 bg-surface-raised px-2.5 py-[5px] font-display text-[11px] font-semibold text-foreground"
                  >
                    <span className="size-1.5 rounded-full bg-primary" />
                    {app.win.title}
                  </button>
                );
              })}
            </div>
          )}

          {phase === "guest" && (
            <div className="chrome-flat absolute bottom-[52px] left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 bg-surface-raised px-3.5 py-1.5 font-mono text-[11px] text-muted-foreground">
              Guest mode. Progress saves to this browser only.
              <button type="button" onClick={exitGuest} className="text-primary hover:underline">
                Create account to save
              </button>
            </div>
          )}

          {flag("commandPalette") && <CommandPalette />}
          <SessionBriefing />
          <DailyGreeting />
          <Celebrations />

          <Taskbar onOpenSettings={() => openApp("settings")} />
        </WindowActionsProvider>
      )}
    </main>
  );
}
