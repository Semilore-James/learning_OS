/* ============================================================================
   Milestone events. Unlike the notification feed (which is derived live from
   state), a milestone fires once when it is first earned. We keep a small
   localStorage feed of what has fired and a set of keys already fired, so:
     - the notification bell can surface recent ones
     - the level-up overlay can react to a new "level-*" milestone
   ========================================================================== */
import type { AppState } from "@/lib/store/types";
import { progressSummary } from "@/lib/gamification";
import { CASES_BY_ID } from "@/content/cases/registry";

export type MilestoneKind = "level" | "case" | "video" | "streak" | "portfolio";

export interface Milestone {
  key: string;
  kind: MilestoneKind;
  title: string;
  detail: string;
  /** window id to open from the bell */
  open?: string;
  /** set on kind "level" */
  level?: number;
}

export interface FeedItem extends Milestone {
  at: number;
}

const FEED_KEY = "da-os-milestone-feed";
const SEEN_KEY = "da-os-milestone-keys";
const SHOWN_KEY = "da-os-levelup-shown";
const FEED_MAX = 30;
const RECENT_MS = 48 * 60 * 60 * 1000;
const LEVELUP_WINDOW_MS = 30_000;

const STREAK_MARKS = [7, 30, 100, 365];

const LEVEL_BLURB = (n: number) =>
  n <= 3
    ? "Keep the momentum."
    : n <= 6
      ? "You're past the starter levels now."
      : n <= 12
        ? "This is what consistent work looks like."
        : "Genuinely strong progress.";

/** every milestone the learner currently qualifies for */
export function detectEarned(state: AppState): Milestone[] {
  const p = progressSummary(state);
  const out: Milestone[] = [];

  for (let l = 2; l <= p.level; l++) {
    out.push({
      key: `level-${l}`,
      kind: "level",
      level: l,
      title: `Level ${l}`,
      detail: LEVEL_BLURB(l),
    });
  }

  for (const [id, c] of Object.entries(state.cases)) {
    if (!c.status.startsWith("complete")) continue;
    const def = CASES_BY_ID[id];
    out.push({
      key: `case-${id}`,
      kind: "case",
      title: def ? `Case ${def.num} cleared` : "Case cleared",
      detail: def ? def.title : "One more in the portfolio.",
      open: "casefiles",
    });
  }

  const vids = Object.keys(state.videoWatches ?? {});
  vids.forEach((vid, i) => {
    out.push({
      key: `video-${vid}`,
      kind: "video",
      title: "Video finished",
      detail: `That's ${i + 1} video${i === 0 ? "" : "s"} watched all the way through.`,
      open: "videoLibrary",
    });
  });

  for (const m of STREAK_MARKS) {
    if (p.longestStreak >= m) {
      out.push({
        key: `streak-${m}`,
        kind: "streak",
        title: `${m}-day streak`,
        detail: m >= 100 ? "That is a real habit now." : "Consistency is the whole game.",
      });
    }
  }

  if (p.casesDone >= 1) {
    out.push({
      key: "portfolio-unlock",
      kind: "portfolio",
      title: "Portfolio unlocked",
      detail: "Your first case is done. The commendation generator is available.",
    });
  }

  return out;
}

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function readFeed(): FeedItem[] {
  try {
    return JSON.parse(localStorage.getItem(FEED_KEY) ?? "[]") as FeedItem[];
  } catch {
    return [];
  }
}

/**
 * Compare earned milestones against what has already fired. Append the new ones
 * to the feed, remember their keys, and return just the new ones (so the caller
 * can react, e.g. show the level-up overlay). First run for a learner who
 * already has progress seeds everything silently (no back-dated fanfare).
 */
export function syncMilestones(state: AppState): Milestone[] {
  if (typeof window === "undefined" || !state.ready) return [];
  const earned = detectEarned(state);
  const seen = readSeen();
  const firstRun = seen.size === 0 && localStorage.getItem(SEEN_KEY) === null;

  const fresh = earned.filter((m) => !seen.has(m.key));
  if (fresh.length === 0) return [];

  for (const m of earned) seen.add(m.key);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }

  if (firstRun) return []; // seed quietly, don't celebrate history

  const now = Date.now();
  const feed = [...fresh.map((m) => ({ ...m, at: now })), ...readFeed()].slice(0, FEED_MAX);
  try {
    localStorage.setItem(FEED_KEY, JSON.stringify(feed));
  } catch {
    /* ignore */
  }
  return fresh;
}

/** feed items from the last 48h, newest first — for the notification bell */
export function recentMilestones(): FeedItem[] {
  const now = Date.now();
  return readFeed().filter((f) => now - f.at < RECENT_MS);
}

/**
 * A level-up worth showing the celebratory overlay for: a "level" feed item
 * from the last ~30s that the overlay hasn't shown yet. Survives component
 * remounts (the decision lives in the feed + a shown-set, not React state).
 */
export function pendingLevelUp(): number | null {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  let shown: string[];
  try {
    shown = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? "[]") as string[];
  } catch {
    shown = [];
  }
  const hit = readFeed().find(
    (f) => f.kind === "level" && now - f.at < LEVELUP_WINDOW_MS && !shown.includes(f.key),
  );
  return hit?.level ?? null;
}

export function ackLevelUp(level: number): void {
  try {
    const shown = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? "[]") as string[];
    const key = `level-${level}`;
    if (!shown.includes(key)) localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown, key].slice(-40)));
  } catch {
    /* ignore */
  }
}
