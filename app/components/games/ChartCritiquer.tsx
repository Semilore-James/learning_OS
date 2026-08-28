"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CRITIQUE_ROUNDS } from "@/lib/games/miniGames";

export function ChartCritiquer() {
  const { state, dispatch } = useStore();
  const best = state.games.chart_critiquer?.level ?? 0;
  const [i, setI] = useState(Math.min(best, CRITIQUE_ROUNDS.length - 1));
  const [pick, setPick] = useState<number | null>(null);

  const round = CRITIQUE_ROUNDS[i];
  const correct = pick === round.answer;
  const max = Math.max(...round.series.map((s) => s.value));
  const min = round.yStart;

  const choose = (o: number) => {
    if (pick !== null) return;
    setPick(o);
    if (o === round.answer) {
      dispatch({ type: "recordGameScore", game: "chart_critiquer", level: i + 1, score: i + 1 });
      dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: i + 1, passed: true });
    } else {
      dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: i + 1, passed: false });
    }
  };

  const next = () => {
    setPick(null);
    setI((n) => Math.min(n + 1, CRITIQUE_ROUNDS.length - 1));
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Round {i + 1} / {CRITIQUE_ROUNDS.length}
      </span>
      <h3 className="font-display text-sm font-bold text-foreground">{round.title}</h3>

      <div className="chrome-flat flex h-40 items-end gap-3 bg-surface-raised p-3">
        {round.series.map((s) => {
          const h = ((s.value - min) / (max - min || 1)) * 100;
          return (
            <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div className="w-full bg-primary" style={{ height: `${Math.max(3, h)}%` }} />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{s.label}</span>
            </div>
          );
        })}
        <span className="self-start font-mono text-[9px] text-muted-foreground">y from {round.yStart}</span>
      </div>
      <p className="text-xs italic text-muted-foreground">{round.caption}</p>

      <p className="text-[11px] font-semibold text-foreground">What&apos;s the main problem?</p>
      <div className="grid grid-cols-2 gap-2">
        {round.options.map((o, oi) => (
          <button
            key={o}
            type="button"
            onClick={() => choose(oi)}
            className={cn(
              "chrome-flat px-3 py-2 text-left text-[11px]",
              pick === null && "bg-surface-raised text-foreground hover:text-primary",
              pick !== null && oi === round.answer && "bg-brand-green/15 text-brand-green",
              pick === oi && oi !== round.answer && "bg-[#e5484d]/15 text-[#e5484d]",
              pick !== null && oi !== round.answer && pick !== oi && "bg-surface-raised text-muted-foreground opacity-60",
            )}
          >
            {o}
          </button>
        ))}
      </div>

      {pick !== null && (
        <div className="chrome-flat bg-surface-raised p-3 text-xs">
          <p className={cn("font-bold", correct ? "text-brand-green" : "text-[#e5484d]")}>
            {correct ? "Right." : "The flagged answer is highlighted."}
          </p>
          <p className="mt-1 text-muted-foreground">{round.explain}</p>
          {i < CRITIQUE_ROUNDS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="chrome-flat mt-2 bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
            >
              Next round →
            </button>
          ) : (
            <p className="mt-2 font-semibold text-foreground">Last round done.</p>
          )}
        </div>
      )}
    </div>
  );
}
