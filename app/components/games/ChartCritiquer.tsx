"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { critiqueRound } from "@/lib/games/miniGamesGen";
import { FlawedChart } from "./FlawedChart";

export function ChartCritiquer() {
  const { state, dispatch } = useStore();
  const best = state.games.chart_critiquer?.level ?? 0;
  const [n, setN] = useState(Math.max(1, best + 1));
  const [pick, setPick] = useState<number | null>(null);

  const round = useMemo(() => critiqueRound(n), [n]);
  const correct = pick === round.answer;

  const choose = (o: number) => {
    if (pick !== null) return;
    setPick(o);
    const ok = o === round.answer;
    dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: n, passed: ok });
    if (ok) dispatch({ type: "recordGameScore", game: "chart_critiquer", level: n, score: n });
  };

  const next = () => {
    setPick(null);
    setN((x) => x + 1);
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Round {n}
      </span>
      <h3 className="font-display text-sm font-bold text-foreground">{round.title}</h3>

      <div className="chrome-flat h-48 bg-surface-raised p-2">
        <FlawedChart round={round} />
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
          <button
            type="button"
            onClick={next}
            className="chrome-flat mt-2 bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
          >
            Next round →
          </button>
        </div>
      )}
    </div>
  );
}
