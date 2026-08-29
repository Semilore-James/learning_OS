/* ============================================================================
   A tiny pivot engine for Pivot Puzzle. A pivot is a fold over a grouped index:
   filter the rows, group by the Row keys and Column keys, apply one aggregate
   per cell. Bounded on purpose (Rows <= 2, Columns <= 1, one Value, Filters
   <= 2) so the learner builds the same shape a BI tool would take.
   ========================================================================== */
export type Agg = "sum" | "count" | "avg" | "min" | "max";

export interface PivotConfig {
  rows: string[]; // group-by fields for the row axis
  cols: string[]; // group-by field(s) for the column axis (0 or 1)
  value: string | null; // the measure field ("count" ignores it)
  agg: Agg;
  filters: { field: string; eq: string }[];
}

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[]; // [""] when there is no column axis
  cells: Record<string, Record<string, number>>;
}

export type RawRow = Record<string, string | number>;

const KEY_SEP = " · ";

function fold(vals: number[], agg: Agg): number {
  if (agg === "count") return vals.length;
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  if (agg === "sum") return sum;
  if (agg === "avg") return sum / vals.length;
  if (agg === "min") return Math.min(...vals);
  return Math.max(...vals);
}

export function runPivot(rows: RawRow[], cfg: PivotConfig): PivotResult {
  let data = rows;
  for (const f of cfg.filters) data = data.filter((r) => String(r[f.field]) === f.eq);

  const groups = new Map<string, { rk: string; ck: string; vals: number[] }>();
  for (const r of data) {
    const rk = cfg.rows.map((c) => String(r[c])).join(KEY_SEP) || "(all)";
    const ck = cfg.cols.map((c) => String(r[c])).join(KEY_SEP) || "";
    const key = `${rk}‖${ck}`;
    let g = groups.get(key);
    if (!g) {
      g = { rk, ck, vals: [] };
      groups.set(key, g);
    }
    g.vals.push(cfg.agg === "count" ? 1 : Number(r[cfg.value ?? ""]) || 0);
  }

  const cells: PivotResult["cells"] = {};
  const rowKeys = new Set<string>();
  const colKeys = new Set<string>();
  for (const g of groups.values()) {
    rowKeys.add(g.rk);
    colKeys.add(g.ck);
    (cells[g.rk] ??= {})[g.ck] = Math.round(fold(g.vals, cfg.agg) * 100) / 100;
  }

  return {
    rowKeys: [...rowKeys].sort(),
    colKeys: colKeys.size ? [...colKeys].sort() : [""],
    cells,
  };
}

export function pivotsEqual(a: PivotResult, b: PivotResult): boolean {
  if (a.rowKeys.join("|") !== b.rowKeys.join("|")) return false;
  if (a.colKeys.join("|") !== b.colKeys.join("|")) return false;
  for (const rk of a.rowKeys) {
    for (const ck of a.colKeys) {
      const va = a.cells[rk]?.[ck];
      const vb = b.cells[rk]?.[ck];
      if (va === undefined && vb === undefined) continue;
      if (va === undefined || vb === undefined) return false;
      if (Math.abs(va - vb) > 0.011) return false;
    }
  }
  return true;
}

/** does a config even have enough set to run? */
export function configReady(cfg: PivotConfig): boolean {
  return cfg.rows.length > 0 && (cfg.agg === "count" || cfg.value != null);
}
