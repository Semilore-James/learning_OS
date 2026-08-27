/* ============================================================================
   Spaced repetition scheduling (SM-2, lightly simplified).
   grade: 0 = forgot, 1 = hard, 2 = good, 3 = easy.
   Returns the next interval, ease, reps, and due date.
   ========================================================================== */
import type { ReviewItem } from "./types";

export function schedule(
  item: Pick<ReviewItem, "ease" | "intervalDays" | "reps">,
  grade: 0 | 1 | 2 | 3,
  todayISO: string,
): Pick<ReviewItem, "ease" | "intervalDays" | "reps" | "dueOn" | "lastReviewedAt"> {
  let { ease, reps } = item;
  let interval: number;

  if (grade === 0) {
    reps = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    // SM-2 ease update mapped from a 0..3 grade to SM-2's 0..5 quality
    const q = grade + 2; // 3, 4, 5
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(item.intervalDays * ease);
  }

  const due = new Date(todayISO + "T00:00:00Z");
  due.setUTCDate(due.getUTCDate() + interval);

  return {
    ease: Math.round(ease * 100) / 100,
    intervalDays: interval,
    reps,
    dueOn: due.toISOString().slice(0, 10),
    lastReviewedAt: new Date().toISOString(),
  };
}

export function isDue(item: ReviewItem, todayISO: string): boolean {
  return item.dueOn <= todayISO;
}
