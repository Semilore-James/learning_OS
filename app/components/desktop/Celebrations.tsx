"use client";

/* ============================================================================
   Milestone watcher + level-up overlay. Mounted once in the desktop shell.
   On every store change it diffs earned milestones against what has already
   fired (lib/milestones), feeds new ones to the notification bell, and if a
   new one is a level-up, shows a short celebratory overlay with a recap of
   what the learner has done so far. Respects reduce-effects.
   ========================================================================== */
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { syncMilestones, pendingLevelUp, ackLevelUp } from "@/lib/milestones";
import { progressSummary } from "@/lib/gamification";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { CountUp } from "@/components/motion";

export function Celebrations() {
  const { state } = useStore();
  const motion = useMotionAllowed();
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    if (!state.ready) return;
    // defer a beat: lets the desktop settle, keeps the localStorage diff out of
    // the render path. syncMilestones feeds the bell; pendingLevelUp decides the
    // overlay from the persisted feed so a remount can't lose it.
    const t = setTimeout(() => {
      syncMilestones(state);
      const lvl = pendingLevelUp();
      if (lvl != null) {
        ackLevelUp(lvl);
        setLevelUp(lvl);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [state]);

  if (levelUp == null) return null;

  const p = progressSummary(state);
  const stats: [string, number][] = [
    ["Nodes cleared", p.nodesDone],
    ["Cases cleared", p.casesDone],
    ["Chapters read", p.chaptersRead],
    ["Day streak", p.streak],
    ["Videos watched", p.videosDone],
    ["Coins", p.coins],
  ];

  return (
    <div
      className="fixed inset-0 z-[400] grid place-items-center bg-black/55 backdrop-blur-sm"
      onClick={() => setLevelUp(null)}
    >
      <div
        className="chrome-panel relative w-[380px] max-w-[92vw] overflow-hidden bg-surface p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {motion && (
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="size-40 rounded-full bg-primary/25 blur-3xl" />
          </div>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Level up</span>
        <div className="mt-1 font-display text-5xl font-black text-foreground">
          {motion ? (
            <CountUp value={levelUp} duration={0.9} />
          ) : (
            levelUp
          )}
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          You&apos;re at level {levelUp}. Here&apos;s the work behind it.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map(([label, v]) => (
            <div key={label} className="chrome-flat bg-surface-raised px-2 py-2.5">
              <div className="font-display text-lg font-bold text-foreground">{v}</div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLevelUp(null)}
          className="chrome-flat chrome-press mt-5 w-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"
        >
          Back to it
        </button>
      </div>
    </div>
  );
}
