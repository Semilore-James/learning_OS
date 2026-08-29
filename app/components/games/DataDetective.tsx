"use client";

/* ============================================================================
   Data Detective — real-scale data QA. 20-48 rows, flag every row that breaks a
   rule (0 to 4 of them, some tables are clean). Three wrong flags ends the
   round. Sort a column or show its range to scan systematically instead of
   hunting the ugliest number. Runs in 5-round sets.
   ========================================================================== */
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectiveRound } from "@/lib/games/miniGamesGen";
import { GameSet } from "./GameSet";

export function DataDetective() {
  return (
    <GameSet
      game="data_detective"
      renderRound={(n, resolve) => <Round key={n} n={n} resolve={resolve} />}
    />
  );
}

function Round({ n, resolve }: { n: number; resolve: (passed: boolean) => void }) {
  const round = useMemo(() => detectiveRound(n), [n]);
  const strikeLimit = round.strikeLimit ?? 3;
  const badSet = useMemo(() => new Set(round.badRows), [round]);

  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [strikes, setStrikes] = useState(0);
  const [done, setDone] = useState<null | boolean>(null);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [showRanges, setShowRanges] = useState(false);

  const numericCols = useMemo(() => {
    const out = new Set<number>();
    round.columns.forEach((_, c) => {
      if (round.rows.every((row) => row[c] === "" || typeof row[c] === "number")) out.add(c);
    });
    return out;
  }, [round]);

  const ranges = useMemo(() => {
    const m: Record<number, [number, number]> = {};
    for (const c of numericCols) {
      const vals = round.rows.map((row) => row[c]).filter((v): v is number => typeof v === "number");
      if (vals.length) m[c] = [Math.min(...vals), Math.max(...vals)];
    }
    return m;
  }, [round, numericCols]);

  const view = useMemo(() => {
    const idx = round.rows.map((_, i) => i);
    if (sortCol == null) return idx;
    return [...idx].sort((a, b) => {
      const va = round.rows[a][sortCol];
      const vb = round.rows[b][sortCol];
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });
  }, [round, sortCol, sortAsc]);

  const toggleFlag = (orig: number) => {
    if (done !== null) return;
    const adding = !flags.has(orig);
    const next = new Set(flags);
    if (adding) next.add(orig);
    else next.delete(orig);
    setFlags(next);
    if (adding && !badSet.has(orig)) {
      const s = strikes + 1;
      setStrikes(s);
      if (s >= strikeLimit) {
        setDone(false);
        resolve(false);
      }
    }
  };

  const submit = () => {
    if (done !== null) return;
    const allFound = round.badRows.every((i) => flags.has(i));
    const noFalse = [...flags].every((i) => badSet.has(i));
    const passed = allFound && noFalse;
    setDone(passed);
    resolve(passed);
  };

  const sortBy = (c: number) => {
    if (sortCol === c) setSortAsc((a) => !a);
    else {
      setSortCol(c);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm font-semibold text-foreground">{round.prompt}</p>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-mono text-muted-foreground">
          {round.rows.length} rows · flagged {flags.size}
        </span>
        <span
          className={cn(
            "font-mono",
            strikes === 0 ? "text-muted-foreground" : strikes < strikeLimit ? "text-brand-amber" : "text-[#e5484d]",
          )}
        >
          strikes {strikes}/{strikeLimit}
        </span>
        <button
          type="button"
          onClick={() => setShowRanges((v) => !v)}
          className="chrome-flat bg-surface-raised px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {showRanges ? "hide ranges" : "show ranges"}
        </button>
      </div>

      <div className="max-h-[46vh] overflow-auto">
        <table className="w-full border-collapse font-mono text-[10px]">
          <thead className="sticky top-0 bg-surface">
            <tr>
              <th className="w-7 border border-border bg-surface-raised px-1 py-1" />
              {round.columns.map((c, ci) => (
                <th
                  key={c}
                  onClick={() => sortBy(ci)}
                  className="cursor-pointer select-none border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground hover:text-foreground"
                >
                  <span className="inline-flex items-center gap-1">
                    {c}
                    {sortCol === ci && (sortAsc ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />)}
                  </span>
                </th>
              ))}
            </tr>
            {showRanges && (
              <tr className="text-[9px] text-brand-amber">
                <td className="border border-border bg-surface px-1" />
                {round.columns.map((c, ci) => (
                  <td key={c} className="border border-border bg-surface px-2 py-0.5">
                    {ranges[ci] ? `${ranges[ci][0]} – ${ranges[ci][1]}` : ""}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {view.map((orig) => {
              const flagged = flags.has(orig);
              const isBad = badSet.has(orig);
              return (
                <tr
                  key={orig}
                  onClick={() => toggleFlag(orig)}
                  className={cn(
                    done === null && "cursor-pointer hover:bg-surface-raised",
                    flagged && done === null && "bg-primary/10",
                    done !== null && isBad && "bg-brand-green/15",
                    done !== null && flagged && !isBad && "bg-[#e5484d]/15",
                  )}
                >
                  <td className="border border-border px-1 py-1 text-center">
                    {done === null && flagged && <Flag className="inline size-2.5 text-primary" />}
                    {done !== null && isBad && <Check className="inline size-2.5 text-brand-green" />}
                    {done !== null && flagged && !isBad && <X className="inline size-2.5 text-[#e5484d]" />}
                  </td>
                  {round.rows[orig].map((v, c) => (
                    <td key={c} className="border border-border px-2 py-1 text-foreground">
                      {String(v)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {done === null ? (
        <button
          type="button"
          onClick={submit}
          className="chrome-flat chrome-press w-fit bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground"
        >
          Submit {flags.size} flag{flags.size === 1 ? "" : "s"}
        </button>
      ) : (
        <div className="chrome-flat bg-surface-raised p-3 text-xs">
          <p className={cn("font-bold", done ? "text-brand-green" : "text-[#e5484d]")}>
            {done ? "Clean scan." : strikes >= strikeLimit ? "Three wrong flags. Round over." : "Missed something."}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{round.explain}</p>
        </div>
      )}
    </div>
  );
}
