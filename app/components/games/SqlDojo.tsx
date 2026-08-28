"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Infinity as InfinityIcon, Lock, Play } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getLevel, AUTHORED_LEVELS, SEED_SQL } from "@/lib/games/sqlDojoGen";
import { runQuery, resultsMatch, type QueryResult } from "@/lib/games/sqlEngine";

function ResultTable({ r }: { r: QueryResult }) {
  if (!r.columns.length) return <p className="p-3 font-mono text-[11px] text-muted-foreground">(no rows)</p>;
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse font-mono text-[11px]">
        <thead>
          <tr>
            {r.columns.map((c) => (
              <th key={c} className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {r.rows.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className="border border-border px-2 py-1 text-foreground">
                  {v === null ? "␀" : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SqlDojo() {
  const { state, dispatch } = useStore();
  const best = state.games.sql_dojo?.level ?? 0;
  const [n, setN] = useState(Math.max(1, best + 1));
  const [sql, setSql] = useState("");
  const [running, setRunning] = useState(false);
  const [out, setOut] = useState<QueryResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const level = useMemo(() => getLevel(n), [n]);

  const go = useCallback((to: number) => {
    setN(Math.max(1, to));
    setSql("");
    setOut(null);
    setErr(null);
    setPassed(false);
    setShowHint(false);
  }, []);

  const run = useCallback(async () => {
    if (!sql.trim()) return;
    setRunning(true);
    setErr(null);
    const mine = await runQuery(SEED_SQL, sql);
    if (!mine.ok || !mine.result) {
      setErr(mine.error ?? "query failed");
      setOut(null);
      setRunning(false);
      return;
    }
    setOut(mine.result);
    const ref = await runQuery(SEED_SQL, level.reference);
    const good = ref.ok && ref.result ? resultsMatch(mine.result, ref.result, Boolean(level.ordered)) : false;
    setPassed(good);
    dispatch({ type: "recordGameAttempt", game: "sql_dojo", level: level.n, passed: good });
    if (good) dispatch({ type: "recordGameScore", game: "sql_dojo", level: level.n, score: level.n });
    setRunning(false);
  }, [sql, level, dispatch]);

  // windowed level list: everything cleared, plus a few ahead
  const listCount = Math.max(20, best + 6);
  const rows = useMemo(() => Array.from({ length: listCount }, (_, i) => i + 1), [listCount]);

  return (
    <div className="flex h-full">
      <nav className="w-44 min-w-44 overflow-auto border-r border-border bg-surface p-2">
        {rows.map((l) => {
          const locked = l > best + 1;
          const done = l <= best;
          return (
            <button
              key={l}
              type="button"
              disabled={locked}
              onClick={() => go(l)}
              className={cn(
                "flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-[11px]",
                l === n ? "chrome-flat bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
                locked && "cursor-not-allowed opacity-40",
              )}
            >
              <span className="w-5 font-mono text-[10px] text-muted-foreground">{l}</span>
              {locked ? <Lock className="size-3" /> : done ? <Check className="size-3 text-brand-green" /> : null}
              <span className="truncate">{done || l <= best + 1 ? getLevel(l).title : "locked"}</span>
            </button>
          );
        })}
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] text-muted-foreground">
          <InfinityIcon className="size-3" /> generated past {AUTHORED_LEVELS}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-auto p-3">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Level {level.n} · {level.concept}
            {level.n > AUTHORED_LEVELS && " · generated"}
          </span>
          <h3 className="font-display text-sm font-bold text-foreground">{level.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{level.brief}</p>
        </div>

        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          placeholder="SELECT ..."
          className="chrome-flat min-h-24 w-full resize-y bg-surface-raised p-2.5 font-mono text-[12px] text-foreground outline-none"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running}
            className="chrome-flat chrome-press flex items-center gap-1.5 bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
          >
            <Play className="size-3" /> {running ? "running…" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            {showHint ? "hide hint" : "hint"}
          </button>
          {passed && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-brand-green">
              <Check className="size-3" /> Correct — level {level.n} cleared
            </span>
          )}
        </div>

        {showHint && <p className="chrome-flat bg-surface-raised p-2 font-mono text-[11px] text-brand-amber">{level.hint}</p>}
        {err && <p className="chrome-flat bg-surface-raised p-2 font-mono text-[11px] text-[#e5484d]">{err}</p>}
        {out && !err && (
          <div className="chrome-flat bg-surface-raised">
            <ResultTable r={out} />
          </div>
        )}
        {out && !err && !passed && (
          <p className="text-[11px] text-muted-foreground">Runs, but the result doesn&apos;t match the task yet.</p>
        )}

        {passed && (
          <button
            type="button"
            onClick={() => go(n + 1)}
            className="chrome-flat w-fit bg-surface-raised px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
          >
            Next level →
          </button>
        )}
      </div>
    </div>
  );
}
