"use client";

/* ============================================================================
   Review (build step 21). A spaced-repetition queue. Items are added when a
   node is completed or a case review is accepted; the SRS scheduler in the
   store (srs.ts) sets each item's next due date. This window walks the items
   that are due today: show the concept, let the learner self-grade recall
   (Again / Hard / Good / Easy), and the scheduler pushes the next review out.
   ========================================================================== */
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { TOPICS_BY_ID } from "@/content/curriculum";

const GRADES: { g: 0 | 1 | 2 | 3; label: string; tone: string }[] = [
  { g: 0, label: "Again", tone: "text-[#e5484d]" },
  { g: 1, label: "Hard", tone: "text-brand-amber" },
  { g: 2, label: "Good", tone: "text-foreground" },
  { g: 3, label: "Easy", tone: "text-brand-green" },
];

export function ReviewWindow() {
  const { state, dispatch } = useStore();
  const win = useWindowActions();
  const due = useMemo(() => select.dueReviewItems(state), [state]);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const item = due[0];

  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <RotateCcw className="size-7 text-muted-foreground" />
        <p className="font-display text-sm font-bold text-foreground">
          {done > 0 ? `${done} card${done === 1 ? "" : "s"} reviewed` : "Nothing due right now"}
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          New cards land here when you finish a node or accept a case review. Come back tomorrow.
        </p>
      </div>
    );
  }

  const nodeLabel = TOPICS_BY_ID[item.nodeId]?.label ?? item.nodeId;

  const grade = (g: 0 | 1 | 2 | 3) => {
    dispatch({ type: "answerReview", itemId: item.id, grade: g });
    setRevealed(false);
    setDone((n) => n + 1);
  };

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {due.length} due · reps {item.reps}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">{done} done this session</span>
      </div>

      <div className="chrome-panel mt-3 flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Recall this</span>
        <p className="font-display text-lg font-bold text-foreground">{item.concept}</p>
        <button
          type="button"
          onClick={() => win.open("constellation")}
          className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
        >
          from {nodeLabel}
        </button>

        {revealed ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">How well did you remember it?</p>
            <div className="flex gap-2">
              {GRADES.map((x) => (
                <button
                  key={x.g}
                  type="button"
                  onClick={() => grade(x.g)}
                  className={`chrome-flat chrome-press bg-surface-raised px-3 py-1.5 text-[11px] font-bold ${x.tone}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="chrome-flat chrome-press mt-2 bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground"
          >
            Show self-check
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => win.openTextbook()}
        className="mt-3 self-center text-[11px] text-muted-foreground hover:text-foreground"
      >
        Open the textbook to refresh →
      </button>
    </div>
  );
}
