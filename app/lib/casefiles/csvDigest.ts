/* ============================================================================
   Client-side CSV digest for PM-AI case review.

   The learner's cleaned file NEVER leaves the browser. This computes a small
   deterministic summary (columns, types, null %, dupes, sample rows) that gets
   sent to /api/pm-ai/review instead of the file. The PM reacts to the shape and
   spots contradictions between what the learner claimed and what the data shows.

   Council decision (2026-08-29): no Storage bucket, no upload trigger. The
   digest is tiny and deterministic; the file has no reason to move.
   ========================================================================== */
import Papa from "papaparse";
import type { CsvDigest } from "@/lib/ai/types";

/** cap parsing so a 160k-row case file does not lock the tab. Contradiction
 *  spotting does not need the whole thing. */
const ROW_CAP = 20_000;
const SAMPLE_TARGET = 3;

type Row = Record<string, string>;

function inferType(values: string[]): CsvDigest["columns"][number]["type"] {
  const seen = values.filter((v) => v !== "" && v != null).slice(0, 200);
  if (seen.length === 0) return "text";
  let num = 0;
  let date = 0;
  let bool = 0;
  for (const v of seen) {
    const t = v.trim().toLowerCase();
    if (t === "true" || t === "false" || t === "yes" || t === "no" || t === "y" || t === "n") bool++;
    if (/^-?\$?\d[\d,]*\.?\d*%?$/.test(t)) num++;
    if (/^\d{4}-\d{2}-\d{2}([ t]\d{2}:\d{2})?/.test(t) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(t)) date++;
  }
  const n = seen.length;
  if (bool / n > 0.9) return "bool";
  if (date / n > 0.8) return "date";
  if (num / n > 0.8) return "number";
  return "text";
}

export interface DigestResult {
  digest: CsvDigest | null;
  /** a human line for the confirmation chip, or an error reason */
  summary: string;
}

export function digestCsvFile(file: File): Promise<DigestResult> {
  return new Promise((resolve) => {
    const rows: Row[] = [];
    let fields: string[] = [];
    let total = 0;
    let stoppedEarly = false;

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: "greedy",
      worker: true,
      step: (res, parser) => {
        total++;
        if (rows.length < ROW_CAP) {
          rows.push(res.data);
          if (res.meta.fields && fields.length === 0) fields = res.meta.fields;
        } else if (!stoppedEarly) {
          stoppedEarly = true;
          parser.abort();
        }
      },
      complete: () => {
        if (fields.length === 0 || rows.length === 0) {
          resolve({ digest: null, summary: "Could not read that as a CSV. Sending your notes only." });
          return;
        }

        const seenRowKeys = new Set<string>();
        let duplicateRows = 0;
        for (const r of rows) {
          const key = fields.map((f) => r[f] ?? "").join("");
          if (seenRowKeys.has(key)) duplicateRows++;
          else seenRowKeys.add(key);
        }

        const columns = fields.slice(0, 60).map((name) => {
          const raw = rows.map((r) => (r[name] ?? "").toString());
          const nonNull = raw.filter((v) => v.trim() !== "");
          const nullPct = Math.round(((raw.length - nonNull.length) / raw.length) * 100);
          const sample: string[] = [];
          for (const v of nonNull) {
            if (sample.length >= SAMPLE_TARGET) break;
            if (!sample.includes(v)) sample.push(v.slice(0, 60));
          }
          return { name: name.slice(0, 80), type: inferType(raw), nullPct, sample };
        });

        const rowCount = stoppedEarly ? Math.max(total, ROW_CAP) : total;
        const digest: CsvDigest = {
          fileName: file.name.slice(0, 120),
          rowCount,
          truncated: stoppedEarly,
          duplicateRows,
          columns,
        };
        const dupNote = duplicateRows > 0 ? `, ${duplicateRows} duplicate rows` : "";
        const trunc = stoppedEarly ? ` (first ${ROW_CAP.toLocaleString()} scanned)` : "";
        resolve({
          digest,
          summary: `PM will see: ${columns.length} columns, ${rowCount.toLocaleString()} rows${dupNote}${trunc}.`,
        });
      },
      error: () => resolve({ digest: null, summary: "Could not read that file. Sending your notes only." }),
    });
  });
}
