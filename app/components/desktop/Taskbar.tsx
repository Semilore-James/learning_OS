"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { TOPICS, TOPICS_BY_ID } from "@/content/curriculum";
import { CountUp, Pulse } from "@/components/motion";

function useClock() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setT(`${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/** the track the learner is mid-way through, if any */
function activeTrack(nodes: Record<string, { state: string; topicId: string | null }>) {
  // an explicitly-active topic, or the topic owning an active sub-node
  const activeTopic = TOPICS.find((t) => nodes[t.id]?.state === "active");
  if (activeTopic) return activeTopic;
  for (const p of Object.values(nodes)) {
    if (p.state === "active" && p.topicId) return TOPICS_BY_ID[p.topicId] ?? null;
  }
  return null;
}

export function Taskbar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state, dispatch, syncing } = useStore();
  const win = useWindowActions();
  const clock = useClock();
  const { current: streak } = select.streak(state);
  const xp = state.xpTotal;
  const xpInLevel = xp % 1000;
  const nextTheme = state.profile.theme === "dark" ? "light" : "dark";
  const track = activeTrack(state.nodes);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[200] flex h-11 items-center justify-between px-4"
      style={{ background: "var(--surface)", borderTop: "var(--bd)" }}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[13px] font-bold tracking-tight text-primary">DA // OS</span>
        {track && (
          <button
            type="button"
            onClick={() => {
              win.open("constellation");
              win.open(`subconstellation:${track.id}`);
            }}
            className="chrome-flat chrome-press flex items-center gap-1.5 bg-surface-raised px-2.5 py-1 text-[11px] font-semibold text-foreground"
          >
            <Play className="size-3 fill-primary text-primary" />
            Continue: {track.label.replace(/\n/g, " ")}
          </button>
        )}
      </div>

      <span className="font-mono text-[13px] text-foreground">{clock}</span>

      <div className="flex items-center gap-3.5">
        {syncing && <span className="font-mono text-[9px] text-muted-foreground">saving…</span>}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-brand-amber">
            <CountUp value={xp} /> XP
          </span>
          <span className="block h-1 w-14 bg-surface-raised">
            <span className="block h-full bg-brand-amber transition-[width] duration-500" style={{ width: `${(xpInLevel / 1000) * 100}%` }} />
          </span>
        </div>
        <Pulse trigger={streak} className="items-center gap-1 text-[11px] font-bold text-brand-amber">
          🔥 {streak}
        </Pulse>
        <button
          type="button"
          aria-label={`Switch to ${nextTheme} theme`}
          onClick={() => dispatch({ type: "setTheme", theme: nextTheme })}
          className="grid size-[30px] place-items-center text-[15px] text-foreground hover:bg-surface-raised"
        >
          {state.profile.theme === "dark" ? "☾" : "☀"}
        </button>
        <button
          type="button"
          aria-label="Open settings"
          onClick={onOpenSettings}
          className="chrome-flat size-7 bg-brand-violet text-[10px] font-bold text-white"
        >
          {(state.profile.displayName?.[0] ?? "A").toUpperCase()}
        </button>
      </div>
    </div>
  );
}
