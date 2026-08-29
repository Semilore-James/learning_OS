/* ============================================================================
   Notification feed for the taskbar bell. Items are derived live from store
   state; a per-item "seen" timestamp lives in localStorage and expires after
   24h, so each kind re-badges at most once a day.
   ========================================================================== */
import type { AppState } from "@/lib/store/types";
import * as select from "@/lib/store/selectors";

export interface Notif {
  id: string;
  /** window id to open when clicked, if any */
  open?: string;
  title: string;
  detail?: string;
  tone: "info" | "warn";
}

const SEEN_KEY = "da-os-notif-seen";
const DAY_MS = 24 * 60 * 60 * 1000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** the live list, newest-relevant first */
export function buildNotifs(state: AppState, lastError: string | null): Notif[] {
  const out: Notif[] = [];

  const due = select.dueReviewCount(state);
  if (due > 0) {
    out.push({
      id: `review-${todayStr()}`,
      open: "review",
      title: `${due} card${due === 1 ? "" : "s"} due for review`,
      detail: "Spaced repetition keeps it from slipping.",
      tone: "info",
    });
  }

  const submitted = Object.entries(state.cases).filter(([, c]) => c.status === "submitted");
  if (submitted.length > 0) {
    out.push({
      id: `cases-awaiting-${submitted.map(([id]) => id).join(",")}`,
      open: "casefiles",
      title: `${submitted.length} case${submitted.length === 1 ? "" : "s"} awaiting your decision`,
      detail: "Accept the PM's review, revise, or override.",
      tone: "info",
    });
  }

  const streak = select.streak(state).current;
  const activeToday = (state.heatmap[todayStr()] ?? 0) > 0;
  const hour = new Date().getHours();
  if (streak > 0 && !activeToday && hour >= 12) {
    out.push({
      id: `streak-${todayStr()}`,
      open: "constellation",
      title: `Your ${streak}-day streak needs activity today`,
      detail: "Anything counts — a chapter, a case, a game.",
      tone: "warn",
    });
  }

  if (lastError) {
    out.push({
      id: "sync-error", // never seen-tracked — clears itself when the error goes away
      title: "A change didn't save",
      detail: lastError.slice(0, 120),
      tone: "warn",
    });
  }

  return out;
}

function readSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

/** how many of these the learner hasn't acknowledged in the last 24h */
export function unseenCount(notifs: Notif[]): number {
  const seen = readSeen();
  const now = Date.now();
  return notifs.filter((n) => {
    if (n.id === "sync-error") return true; // always shows as unseen while present
    const at = seen[n.id];
    return !at || now - at > DAY_MS;
  }).length;
}

/** stamp every current item as seen now */
export function markAllSeen(notifs: Notif[]): void {
  try {
    const seen = readSeen();
    const now = Date.now();
    for (const n of notifs) seen[n.id] = now;
    // prune anything older than a week
    for (const k of Object.keys(seen)) if (now - seen[k] > 7 * DAY_MS) delete seen[k];
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}
