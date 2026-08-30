"use client";

/* ============================================================================
   The PM's daily line. Shows a small card in the top-right a couple of seconds
   after the desktop is ready, once per calendar day. The line also lands in
   the notification bell (via lib/greeting -> lib/notifications), so dismissing
   the card doesn't lose it.
   ========================================================================== */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickGreeting } from "@/lib/greeting";

const SEEN_KEY = "da-os-greeting-card-day";

export function DailyGreeting() {
  const { state } = useStore();
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!state.ready) return;
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
    // short delay only to clear the boot frame; a remount re-shows it just as
    // fast, so there is never a long gap where it is missing
    const t = setTimeout(() => setText(g.text), 400);
    return () => clearTimeout(t);
  }, [state.ready]);

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      /* ignore */
    }
    setText(null);
  };

  if (!text) return null;

  return (
    <div className="da-msg-in absolute right-4 top-4 z-[190] w-[300px] max-w-[85vw]">
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
