"use client";

/* ============================================================================
   Pivot Puzzle — configure a pivot to match a target. You get a business ask
   ("Finance wants total revenue per region, split by quarter, Won only") and a
   raw table; assign fields to Rows / Columns / Value / Filters until your
   result matches the target's shape and numbers. Same skill as building a pivot
   table in any BI tool. Runs in 5-round sets.
   ========================================================================== */
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pivotRound } from "@/lib/games/miniGamesGen";
import {
  runPivot,
  pivotsEqual,
  configReady,
  type Agg,
  type PivotConfig,
  type RawRow,
} from "@/lib/games/pivotEngine";
import { GameSet } from "./GameSet";

const AGGS: Agg[] = ["sum", "count", "avg", "min", "max"];

export function PivotPuzzle() {
  return (
    <GameSet game="pivot_puzzle" renderRound={(n, resolve) => <Round key={n} n={n} resolve={resolve} />} />
  );
}

function Round({ n, resolve }: { n: number; resolve: (passed: boolean) => void }) {
  const round = useMemo(() => pivotRound(n), [n]);
  const raw = useMemo<RawRow[]>(
    () => round.rows.map((row) => Object.fromEntries(round.columns.map((c, i) => [c, row[i]]))),
    [round],
  );
  const targetResult = useMemo(() => runPivot(raw, round.target), [raw, round]);

  const [cfg, setCfg] = useState<PivotConfig>({
    rows: [],
    cols: [],
    value: null,
    agg: "sum",
    filters: [],
  });
  const [done, setDone] = useState<null | boolean>(null);

  const result = useMemo(
    () => (configReady(cfg) ? runPivot(raw, cfg) : null),
    [raw, cfg],
  );

  const assign = (field: string, zone: "rows" | "cols" | "value" | "filter") => {
    if (done !== null) return;
    setCfg((c) => {
      const next = { ...c, rows: [...c.rows], cols: [...c.cols], filters: [...c.filters] };
      // remove field from any zone first
      next.rows = next.rows.filter((f) => f !== field);
      next.cols = next.cols.filter((f) => f !== field);
      next.filters = next.filters.filter((f) => f.field !== field);
      if (next.value === field) next.value = null;
      if (zone === "rows" && next.rows.length < 2) next.rows.push(field);
      else if (zone === "cols" && next.cols.length < 1) next.cols.push(field);
      else if (zone === "value") next.value = field;
      else if (zone === "filter" && next.filters.length < 2) {
        const opts = round.filterValues[field] ?? [];
        next.filters.push({ field, eq: opts[0] ?? "" });
      }
      return next;
    });
  };

  const removeFrom = (zone: "rows" | "cols" | "value" | "filter", field: string) => {
    if (done !== null) return;
    setCfg((c) => ({
      ...c,
      rows: zone === "rows" ? c.rows.filter((f) => f !== field) : c.rows,
      cols: zone === "cols" ? c.cols.filter((f) => f !== field) : c.cols,
      value: zone === "value" ? null : c.value,
      filters: zone === "filter" ? c.filters.filter((f) => f.field !== field) : c.filters,
    }));
  };

  const setFilterEq = (field: string, eq: string) =>
    setCfg((c) => ({ ...c, filters: c.filters.map((f) => (f.field === field ? { ...f, eq } : f)) }));

  const check = () => {
    if (done !== null || !result) return;
    const passed = pivotsEqual(result, targetResult);
    setDone(passed);
    resolve(passed);
  };

  const zoneBox = (label: string, body: React.ReactNode) => (
    <div className="chrome-flat min-h-[38px] bg-surface-raised px-2 py-1.5">
      <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-0.5 flex flex-wrap items-center gap-1">{body}</div>
    </div>
  );

  const chip = (text: string, onRemove: () => void) => (
    <span key={text} className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
      {text}
      <button type="button" onClick={onRemove} aria-label="remove">
        <X className="size-2.5" />
      </button>
    </span>
  );

  const allFields = [...round.dims, ...round.measures];
  const placed = (f: string) =>
    cfg.rows.includes(f) || cfg.cols.includes(f) || cfg.value === f || cfg.filters.some((x) => x.field === f);

  const showValues = done === true;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="chrome-flat bg-surface-raised px-3 py-2 text-[12px] text-foreground">
        <span className="font-mono text-[9px] uppercase tracking-widest text-brand-amber">The ask</span>
        <p className="mt-0.5">{round.prompt}</p>
      </div>

      {/* field tray */}
      <div className="flex flex-wrap gap-1.5">
        {allFields.map((f) => (
          <div
            key={f}
            className={cn(
              "chrome-flat flex items-center gap-1 bg-surface px-2 py-1 text-[10px]",
              placed(f) ? "opacity-40" : "text-foreground",
            )}
          >
            <span className="font-mono">{f}</span>
            <button type="button" onClick={() => assign(f, "rows")} className="text-muted-foreground hover:text-primary">R</button>
            <button type="button" onClick={() => assign(f, "cols")} className="text-muted-foreground hover:text-primary">C</button>
            {round.measures.includes(f) && (
              <button type="button" onClick={() => assign(f, "value")} className="text-muted-foreground hover:text-primary">V</button>
            )}
            {round.dims.includes(f) && (
              <button type="button" onClick={() => assign(f, "filter")} className="text-muted-foreground hover:text-primary">F</button>
            )}
          </div>
        ))}
        <span className="self-center text-[9px] text-muted-foreground">R rows · C cols · V value · F filter</span>
      </div>

      {/* zones */}
      <div className="grid grid-cols-2 gap-2">
        {zoneBox("Rows (max 2)", cfg.rows.map((f) => chip(f, () => removeFrom("rows", f))))}
        {zoneBox("Columns (max 1)", cfg.cols.map((f) => chip(f, () => removeFrom("cols", f))))}
        {zoneBox(
          "Value",
          <>
            {cfg.value && chip(cfg.value, () => removeFrom("value", cfg.value!))}
            <select
              value={cfg.agg}
              onChange={(e) => setCfg((c) => ({ ...c, agg: e.target.value as Agg }))}
              className="bg-surface text-[10px] text-foreground"
            >
              {AGGS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </>,
        )}
        {zoneBox(
          "Filters (max 2)",
          cfg.filters.map((f) => (
            <span key={f.field} className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
              {f.field} =
              <select
                value={f.eq}
                onChange={(e) => setFilterEq(f.field, e.target.value)}
                className="bg-surface text-[10px]"
              >
                {(round.filterValues[f.field] ?? []).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <button type="button" onClick={() => removeFrom("filter", f.field)} aria-label="remove">
                <X className="size-2.5" />
              </button>
            </span>
          )),
        )}
      </div>

      {/* target shape + your result side by side */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <PivotGrid title="Target" res={targetResult} showValues={showValues} />
        <PivotGrid title="Your build" res={result} showValues />
      </div>

      {done === null ? (
        <button
          type="button"
          onClick={check}
          disabled={!result}
          className="chrome-flat chrome-press w-fit bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
        >
          Check
        </button>
      ) : (
        <div className="chrome-flat bg-surface-raised p-3 text-xs">
          <p className={cn("font-bold", done ? "text-brand-green" : "text-[#e5484d]")}>
            {done ? "Matches the target." : "Not a match yet."}
          </p>
          {!done && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Target config: rows [{round.target.rows.join(", ")}]
              {round.target.cols.length ? ` · cols [${round.target.cols.join(", ")}]` : ""}
              {" · "}{round.target.agg}
              {round.target.value ? ` of ${round.target.value}` : ""}
              {round.target.filters.length
                ? ` · filter ${round.target.filters.map((f) => `${f.field}=${f.eq}`).join(", ")}`
                : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PivotGrid({
  title,
  res,
  showValues,
}: {
  title: string;
  res: import("@/lib/games/pivotEngine").PivotResult | null;
  showValues: boolean;
}) {
  return (
    <div>
      <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{title}</span>
      {!res ? (
        <p className="mt-1 text-muted-foreground">—</p>
      ) : (
        <div className="mt-1 overflow-auto">
          <table className="border-collapse font-mono text-[9px]">
            <thead>
              <tr>
                <th className="border border-border px-1.5 py-0.5" />
                {res.colKeys.map((ck) => (
                  <th key={ck} className="border border-border px-1.5 py-0.5 text-left text-muted-foreground">
                    {ck || "value"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {res.rowKeys.map((rk) => (
                <tr key={rk}>
                  <td className="border border-border px-1.5 py-0.5 text-muted-foreground">{rk}</td>
                  {res.colKeys.map((ck) => (
                    <td key={ck} className="border border-border px-1.5 py-0.5 text-foreground">
                      {showValues ? (res.cells[rk]?.[ck] ?? "") : "·"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
