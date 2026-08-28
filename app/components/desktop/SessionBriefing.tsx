"use client";

/* ============================================================================
   Session briefing (build step 21). A one-time-per-day card: streak, reviews
   due, and the track to continue. Shows a few seconds after the desktop is
   ready; dismiss by clicking it or the X. "Seen" is stamped per calendar day
   in localStorage so it doesn't nag on every window focus.
   ========================================================================== */
import { useEffect, useState } from "react";
import { Flame, RotateCcw, X } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { TOPICS, TOPICS_BY_ID } from "@/content/curriculum";

const KEY = "da-os-briefing-day";

export function SessionBriefing() {
  const { state } = useStore();
  const win = useWindowActions();
  const [show, setShow] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const streak = select.streak(state).current;
  const dueCount = select.dueReviewCount(state);

  const activeSub = select.activeNodeId(state);
  const activeTopic =
    TOPICS.find((t) => state.nodes[t.id]?.state === "active") ??
    (activeSub && state.nodes[activeSub]?.topicId
      ? TOPICS_BY_ID[state.nodes[activeSub].topicId as string]
      : null);

  useEffect(() => {
    if (!state.ready) return;
    let seen = false;
    try {
      seen = localStorage.getItem(KEY) === today;
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, [state.ready, today]);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, today);
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="absolute left-1/2 top-6 z-[180] w-[340px] max-w-[90vw] -translate-x-1/2">
      <div className="chrome-panel bg-surface p-4">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
            Today&apos;s briefing
          </span>
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>

        <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-foreground">
          <li className="flex items-center gap-2">
            <Flame className="size-3.5 text-brand-amber" />
            {streak > 0 ? `${streak}-day streak — keep it alive` : "Start a streak today"}
          </li>
          {dueCount > 0 && (
            <li>
              <button
                type="button"
                onClick={() => {
                  win.open("review");
                  dismiss();
                }}
                className="flex items-center gap-2 hover:text-primary"
              >
                <RotateCcw className="size-3.5 text-primary" />
                {dueCount} review{dueCount === 1 ? "" : "s"} due
              </button>
            </li>
          )}
        </ul>

        {activeTopic && (
          <button
            type="button"
            onClick={() => {
              win.open("constellation");
              win.open(`subconstellation:${activeTopic.id}`);
              dismiss();
            }}
            className="chrome-flat chrome-press mt-3 w-full bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground"
          >
            Continue: {activeTopic.label.replace(/\n/g, " ")}
          </button>
        )}
      </div>
    </div>
  );
}
