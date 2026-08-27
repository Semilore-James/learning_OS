/* ============================================================================
   Derived views over AppState. Streak, active node, due reviews, etc.
   Nothing here is stored — always computed from the raw state.
   ========================================================================== */
import type { AppState } from "./types";
import { todayUTC } from "./reducer";
import { isDue } from "./srs";

/** consecutive days up to and including today (or yesterday) with any activity */
export function streak(state: AppState): { current: number; longest: number } {
  const days = Object.keys(state.heatmap)
    .filter((d) => (state.heatmap[d] ?? 0) > 0)
    .sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  const set = new Set(days);
  const dayMs = 86_400_000;

  // longest run anywhere
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = (Date.parse(days[i]) - Date.parse(days[i - 1])) / dayMs;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // current run ending today or yesterday
  const today = Date.parse(todayUTC());
  let current = 0;
  if (set.has(todayUTC()) || set.has(new Date(today - dayMs).toISOString().slice(0, 10))) {
    let cursor = set.has(todayUTC()) ? today : today - dayMs;
    while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
      current++;
      cursor -= dayMs;
    }
  }
  return { current, longest };
}

export function activeNodeId(state: AppState): string | null {
  const entry = Object.entries(state.nodes).find(([, p]) => p.state === "active" && p.level === "sub");
  return entry?.[0] ?? null;
}

export function dueReviewCount(state: AppState): number {
  const t = todayUTC();
  return state.review.filter((r) => isDue(r, t)).length;
}

export function completedNodeIds(state: AppState): Set<string> {
  return new Set(
    Object.entries(state.nodes)
      .filter(([, p]) => p.state === "completed")
      .map(([id]) => id),
  );
}

export function startedNodeIds(state: AppState): Set<string> {
  return new Set(
    Object.entries(state.nodes)
      .filter(([, p]) => p.state === "active")
      .map(([id]) => id),
  );
}

export function todayLog(state: AppState) {
  return state.dailyLog[todayUTC()] ?? null;
}
