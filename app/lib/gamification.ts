/* ============================================================================
   Shared XP / level math and a progress snapshot, used by the profile card,
   the shop, the level-up overlay, and the milestone watcher so they all agree
   on what "level 5" and "coins" mean.
   ========================================================================== */
import type { AppState } from "@/lib/store/types";
import * as select from "@/lib/store/selectors";

export const XP_PER_LEVEL = 1000;

export const levelFromXp = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export interface ProgressSummary {
  level: number;
  xp: number;
  intoLevel: number;
  coins: number;
  streak: number;
  longestStreak: number;
  nodesDone: number;
  casesDone: number;
  chaptersRead: number;
  videosDone: number;
  activeDays: number;
}

export function progressSummary(state: AppState): ProgressSummary {
  const xp = state.xpTotal;
  const s = select.streak(state);
  return {
    level: levelFromXp(xp),
    xp,
    intoLevel: xp % XP_PER_LEVEL,
    coins: select.coinBalance(state),
    streak: s.current,
    longestStreak: s.longest,
    nodesDone: select.completedNodeIds(state).size,
    casesDone: Object.values(state.cases).filter((c) => c.status.startsWith("complete")).length,
    chaptersRead: Object.keys(state.chapterReads ?? {}).length,
    videosDone: Object.keys(state.videoWatches ?? {}).length,
    activeDays: Object.values(state.heatmap).filter((w) => w > 0).length,
  };
}
