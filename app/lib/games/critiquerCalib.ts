/* ============================================================================
   Chart Critiquer calibration. Tracks the learner's verdict picks against the
   true verdict so the game can hold up a mirror: "you call every chart
   misleading" or "you trust charts you shouldn't". Local, per-browser, capped.
   ========================================================================== */
import type { Verdict } from "./miniGames";

const KEY = "da-os-critiquer-calib";
const CAP = 24;

interface Row {
  truth: Verdict;
  pick: Verdict;
}

function read(): Row[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Row[];
  } catch {
    return [];
  }
}

export function recordVerdict(truth: Verdict, pick: Verdict): void {
  try {
    const rows = [...read(), { truth, pick }].slice(-CAP);
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

/** a one-line nudge when the pattern is clear, or null */
export function calibrationHint(): string | null {
  const rows = read();
  if (rows.length < 8) return null;

  const honest = rows.filter((r) => r.truth === "safe");
  const criedWolf = honest.filter((r) => r.pick === "misleading").length;
  if (honest.length >= 4 && criedWolf / honest.length >= 0.6) {
    return "You call a chart misleading more often than it is. Some of them are honest.";
  }

  const misleading = rows.filter((r) => r.truth === "misleading");
  const trusted = misleading.filter((r) => r.pick === "safe").length;
  if (misleading.length >= 4 && trusted / misleading.length >= 0.5) {
    return "You're trusting charts that are working you. Slow down on the claim.";
  }

  const cantTell = rows.filter((r) => r.truth === "cant-tell");
  const forced = cantTell.filter((r) => r.pick !== "cant-tell").length;
  if (cantTell.length >= 4 && forced / cantTell.length >= 0.6) {
    return "Some questions can't be answered from one chart. 'Can't tell' is a real answer.";
  }

  return null;
}
