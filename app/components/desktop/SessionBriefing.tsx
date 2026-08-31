"use client";

/* ============================================================================
   Session briefing (build step 21). A one-time-per-day card: streak, reviews
   due, and the track to continue. It fades and slides away on its own after a
   few seconds; the "Continue" action also lives on the taskbar and the review
   count on the bell, so nothing is lost when it goes. "Seen" is stamped per
   calendar day so it does not nag on every window focus.
   ========================================================================== */
import { useCallback, useEffect, useState } from "react";
import { Flame, RotateCcw, X } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { TOPICS, TOPICS_BY_ID } from "@/content/curriculum";
import { cn } from "@/lib/utils";

const KEY = "da-os-briefing-day";
const DWELL_MS = 5000;

export function SessionBriefing() {
  const { state } = useStore();
  const win = useWindowActions();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

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
    if (!state.ready || state.profile.onboardingPhase !== "done") return;
    let seen = false;
    try {
      seen = localStorage.getItem(KEY) === today;
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, [state.ready, state.profile.onboardingPhase, today]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(KEY, new Date().toISOString().slice(0, 10));
    } catch {
      /* ignore */
    }
    setLeaving(false);
    setShow(false);
  }, []);

  // hover briefly, then fade + slide down
  useEffect(() => {
    if (!show) return;
    const fade = setTimeout(() => setLeaving(true), DWELL_MS);
    const gone = setTimeout(dismiss, DWELL_MS + 320);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [show, dismiss]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute left-1/2 top-6 z-[180] w-[340px] max-w-[90vw] -translate-x-1/2 transition-all duration-300",
        leaving && "translate-y-2 opacity-0",
      )}
    >
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
