/* ============================================================================
   sql.js loader + query runner for SQL Dojo. One in-memory SQLite database per
   level (re-seeded on load). The wasm binary lives in /public/sql-wasm.wasm so
   it is served as a static asset — initSqlJs is pointed at it explicitly.
   ========================================================================== */
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  }
  return sqlPromise;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface RunOutcome {
  ok: boolean;
  result?: QueryResult;
  error?: string;
}

/** build a fresh database from seed SQL, run the learner's query against it */
export async function runQuery(seedSql: string, userSql: string): Promise<RunOutcome> {
  let db: Database | null = null;
  try {
    const SQL = await getSql();
    db = new SQL.Database();
    db.run(seedSql);
    const res = db.exec(userSql);
    if (res.length === 0) return { ok: true, result: { columns: [], rows: [] } };
    const last = res[res.length - 1];
    return {
      ok: true,
      result: {
        columns: last.columns,
        rows: last.values as (string | number | null)[][],
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    db?.close();
  }
}

/** order-insensitive unless the query itself has ORDER BY */
export function resultsMatch(a: QueryResult, b: QueryResult, ordered: boolean): boolean {
  if (a.columns.length !== b.columns.length) return false;
  if (a.rows.length !== b.rows.length) return false;
  const norm = (r: (string | number | null)[]) => r.map((v) => (v === null ? "␀" : String(v))).join("");
  const av = a.rows.map(norm);
  const bv = b.rows.map(norm);
  if (ordered) return av.every((v, i) => v === bv[i]);
  return [...av].sort().join("") === [...bv].sort().join("");
}
