"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DETECTIVE_ROUNDS } from "@/lib/games/miniGames";

export function DataDetective() {
  const { state, dispatch } = useStore();
  const best = state.games.data_detective?.level ?? 0;
  const [i, setI] = useState(Math.min(best, DETECTIVE_ROUNDS.length - 1));
  const [guess, setGuess] = useState<number | null>(null);

  const round = DETECTIVE_ROUNDS[i];
  const solved = guess === round.badRow;

  const submit = (rowIdx: number) => {
    if (guess !== null) return;
    setGuess(rowIdx);
    if (rowIdx === round.badRow) {
      dispatch({ type: "recordGameScore", game: "data_detective", level: i + 1, score: i + 1 });
      dispatch({ type: "recordGameAttempt", game: "data_detective", level: i + 1, passed: true });
    } else {
      dispatch({ type: "recordGameAttempt", game: "data_detective", level: i + 1, passed: false });
    }
  };

  const next = () => {
    setGuess(null);
    setI((n) => Math.min(n + 1, DETECTIVE_ROUNDS.length - 1));
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Round {i + 1} / {DETECTIVE_ROUNDS.length}
      </span>
      <p className="text-sm font-semibold text-foreground">{round.prompt}</p>

      <table className="w-full border-collapse font-mono text-[11px]">
        <thead>
          <tr>
            <th className="w-8 border border-border bg-surface-raised px-2 py-1" />
            {round.columns.map((c) => (
              <th key={c} className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {round.rows.map((row, r) => {
            const isGuess = guess === r;
            const isBad = r === round.badRow;
            return (
              <tr
                key={r}
                onClick={() => submit(r)}
                className={cn(
                  "cursor-pointer",
                  guess === null && "hover:bg-surface-raised",
                  guess !== null && isBad && "bg-brand-green/15",
                  guess !== null && isGuess && !isBad && "bg-[#e5484d]/15",
                )}
              >
                <td className="border border-border px-2 py-1 text-center">
                  {guess !== null && isBad && <Check className="inline size-3 text-brand-green" />}
                  {guess !== null && isGuess && !isBad && <X className="inline size-3 text-[#e5484d]" />}
                </td>
                {row.map((v, c) => (
                  <td key={c} className="border border-border px-2 py-1 text-foreground">
                    {String(v)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {guess === null && <p className="text-[11px] text-muted-foreground">Click the row you think is wrong.</p>}

      {guess !== null && (
        <div className="chrome-flat bg-surface-raised p-3 text-xs">
          <p className={cn("font-bold", solved ? "text-brand-green" : "text-[#e5484d]")}>
            {solved ? "Correct." : "Not quite."}
          </p>
          <p className="mt-1 text-muted-foreground">{round.because}</p>
          {i < DETECTIVE_ROUNDS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="chrome-flat mt-2 bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
            >
              Next round →
            </button>
          ) : (
            <p className="mt-2 font-semibold text-foreground">That&apos;s the last round — nice work.</p>
          )}
        </div>
      )}
    </div>
  );
}
