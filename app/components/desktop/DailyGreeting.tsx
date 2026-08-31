"use client";

/* ============================================================================
   The PM's daily line. A small card, top-right, once per calendar day. It
   fades and slides away on its own after a few seconds; the same line also
   lands in the notification bell (via lib/greeting -> lib/notifications), so
   nothing is lost when it goes.
   ========================================================================== */
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickGreeting } from "@/lib/greeting";
import { cn } from "@/lib/utils";

const SEEN_KEY = "da-os-greeting-card-day";
const DWELL_MS = 5000;

export function DailyGreeting() {
  const { state } = useStore();
  const [text, setText] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      /* ignore */
    }
    setLeaving(false);
    setText(null);
  }, []);

  useEffect(() => {
    if (!state.ready || state.profile.onboardingPhase !== "done") return;
    const day = new Date().toISOString().slice(0, 10);
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(SEEN_KEY) === day;
    } catch {
      /* ignore */
    }
    // pickGreeting persists today's line so the bell shows it regardless
    const g = pickGreeting();
    if (dismissed || !g) return;
    const t = setTimeout(() => setText(g.text), 400);
    return () => clearTimeout(t);
  }, [state.ready, state.profile.onboardingPhase]);

  // hover briefly, then fade + slide down and stamp it seen for the day
  useEffect(() => {
    if (!text) return;
    const fade = setTimeout(() => setLeaving(true), DWELL_MS);
    const gone = setTimeout(dismiss, DWELL_MS + 320);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [text, dismiss]);

  if (!text) return null;

  return (
    <div
      className={cn(
        "da-msg-in absolute right-4 top-4 z-[190] w-[300px] max-w-[85vw] transition-all duration-300",
        leaving && "translate-y-2 opacity-0",
      )}
    >
      <div className="chrome-panel bg-surface p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-violet">
            Your PM
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  );
}
