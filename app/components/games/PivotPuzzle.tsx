"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PIVOT_ROUNDS, type PivotRound } from "@/lib/games/miniGames";

type Agg = PivotRound["agg"];
const AGGS: Agg[] = ["sum", "count", "avg", "max"];

function computePivot(round: PivotRound, groupBy: string, valueField: string, agg: Agg): [string, number][] {
  const gi = round.columns.indexOf(groupBy);
  const vi = round.columns.indexOf(valueField);
  if (gi < 0 || vi < 0) return [];
  const buckets = new Map<string, number[]>();
  for (const row of round.rows) {
    const key = String(row[gi]);
    const raw = row[vi];
    const num = typeof raw === "number" ? raw : Number(raw);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(agg === "count" ? 1 : num);
  }
  const out: [string, number][] = [];
  for (const [k, vals] of buckets) {
    let v: number;
    if (agg === "count") v = vals.length;
    else if (agg === "sum") v = vals.reduce((a, b) => a + b, 0);
    else if (agg === "avg") v = vals.reduce((a, b) => a + b, 0) / vals.length;
    else v = Math.max(...vals);
    out.push([k, Math.round(v * 100) / 100]);
  }
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}

function eq(a: [string, number][], b: [string, number][]) {
  return a.length === b.length && a.every(([k, v], i) => k === b[i][0] && Math.abs(v - b[i][1]) < 0.01);
}

export function PivotPuzzle() {
  const { state, dispatch } = useStore();
  const best = state.games.pivot_puzzle?.level ?? 0;
  const [i, setI] = useState(Math.min(best, PIVOT_ROUNDS.length - 1));
  const round = PIVOT_ROUNDS[i];

  const [groupBy, setGroupBy] = useState("");
  const [valueField, setValueField] = useState("");
  const [agg, setAgg] = useState<Agg>("sum");
  const [checked, setChecked] = useState(false);

  const mine = useMemo(
    () => (groupBy && valueField ? computePivot(round, groupBy, valueField, agg) : []),
    [round, groupBy, valueField, agg],
  );
  const correct = checked && eq(mine, round.expect);

  const reset = (n: number) => {
    setI(n);
    setGroupBy("");
    setValueField("");
    setAgg("sum");
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (eq(computePivot(round, groupBy, valueField, agg), round.expect)) {
      dispatch({ type: "recordGameScore", game: "pivot_puzzle", level: i + 1, score: i + 1 });
      dispatch({ type: "recordGameAttempt", game: "pivot_puzzle", level: i + 1, passed: true });
    } else {
      dispatch({ type: "recordGameAttempt", game: "pivot_puzzle", level: i + 1, passed: false });
    }
  };

  const sel = "chrome-flat bg-surface-raised px-2 py-1 text-[11px] text-foreground outline-none";

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Puzzle {i + 1} / {PIVOT_ROUNDS.length}
      </span>
      <p className="text-sm font-semibold text-foreground">Target: {round.prompt}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Raw rows</p>
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr>
                {round.columns.map((c) => (
                  <th key={c} className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {round.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((v, c) => (
                    <td key={c} className="border border-border px-2 py-1 text-foreground">
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Target output</p>
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr>
                <th className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground">group</th>
                <th className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground">value</th>
              </tr>
            </thead>
            <tbody>
              {round.expect.map(([k, v]) => (
                <tr key={k}>
                  <td className="border border-border px-2 py-1 text-foreground">{k}</td>
                  <td className="border border-border px-2 py-1 text-foreground">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>Group by</span>
        <select className={sel} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="">—</option>
          {round.columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span>, aggregate</span>
        <select className={sel} value={agg} onChange={(e) => setAgg(e.target.value as Agg)}>
          {AGGS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span>of</span>
        <select className={sel} value={valueField} onChange={(e) => setValueField(e.target.value)}>
          <option value="">—</option>
          {round.columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={check}
          disabled={!groupBy || !valueField}
          className="chrome-flat chrome-press bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
        >
          Check
        </button>
      </div>

      {checked && (
        <div className={cn("chrome-flat bg-surface-raised p-3 text-xs", correct ? "text-brand-green" : "text-[#e5484d]")}>
          <p className="font-bold">{correct ? "Matches the target." : "Not a match — try a different field or aggregation."}</p>
          {correct && i < PIVOT_ROUNDS.length - 1 && (
            <button
              type="button"
              onClick={() => reset(i + 1)}
              className="chrome-flat mt-2 bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
            >
              Next puzzle →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
