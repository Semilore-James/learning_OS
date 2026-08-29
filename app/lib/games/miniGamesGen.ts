/* ============================================================================
   Endless rounds for Data Detective, Pivot Puzzle and Chart Critiquer. The
   authored rounds in miniGames.ts are the intro; getXRound(n) synthesises
   everything past that deterministically from n, so each game runs forever.
   ========================================================================== */
import {
  DETECTIVE_ROUNDS,
  PIVOT_ROUNDS,
  CRITIQUE_ROUNDS,
  type DetectiveRound,
  type PivotRound,
  type CritiqueRound,
} from "./miniGames";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const pick = <T>(r: () => number, a: readonly T[]) => a[Math.floor(r() * a.length)];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

export const DETECTIVE_AUTHORED = DETECTIVE_ROUNDS.length;
export const PIVOT_AUTHORED = PIVOT_ROUNDS.length;
export const CRITIQUE_AUTHORED = CRITIQUE_ROUNDS.length;

/* ---------------------------------------------------------- Data Detective -- */
const NAMES = ["Ada", "Kai", "Sam", "Ivy", "Ron", "Mia", "Leo", "Nia", "Tom", "Zoe"];
const PRODUCTS = ["Keyboard", "Monitor", "Hub", "Webcam", "Stand", "Mat", "Cable"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

type Defect =
  | "impossible_date"
  | "negative_qty"
  | "dup_id"
  | "outlier"
  | "bad_pct"
  | "total_mismatch";

export function detectiveRound(n: number): DetectiveRound {
  if (n <= DETECTIVE_AUTHORED) return DETECTIVE_ROUNDS[n - 1];
  const r = rng(n * 2246822519);
  const defect = pick(r, [
    "impossible_date",
    "negative_qty",
    "dup_id",
    "outlier",
    "bad_pct",
    "total_mismatch",
  ] as Defect[]);
  const rowCount = int(r, 4, 5);
  const bad = int(r, 0, rowCount - 1);

  if (defect === "impossible_date") {
    const rows = Array.from({ length: rowCount }, (_, i) => {
      const mm = int(r, 1, 12);
      const dd = i === bad ? pick(r, [31, 32, 30]) : int(r, 1, 28);
      const badMonth = i === bad && pick(r, [true, false]);
      const m = badMonth ? "13" : String(mm).padStart(2, "0");
      return [100 + i, pick(r, NAMES), `2024-${m}-${String(i === bad && !badMonth ? dd : int(r, 1, 28)).padStart(2, "0")}`];
    });
    // force the bad row to be clearly impossible
    rows[bad][2] = pick(r, ["2024-02-30", "2024-04-31", "2024-13-05", "2024-06-31"]);
    return {
      prompt: "One signup date can't be real. Which row?",
      columns: ["id", "name", "signup_date"],
      rows,
      badRow: bad,
      because: `${rows[bad][2]} isn't a valid calendar date.`,
    };
  }

  if (defect === "negative_qty") {
    const rows = Array.from({ length: rowCount }, (_, i) => [
      10 + i,
      pick(r, PRODUCTS),
      i === bad ? -int(r, 1, 5) : int(r, 1, 6),
      int(r, 20, 200),
    ]);
    return {
      prompt: "A quantity column shouldn't allow this value. Which row?",
      columns: ["order_id", "product", "qty", "unit_price"],
      rows,
      badRow: bad,
      because: `A quantity of ${rows[bad][2]} can't be shipped — likely a bad return adjustment.`,
    };
  }

  if (defect === "dup_id") {
    const base = int(r, 100, 180);
    const rows = Array.from({ length: rowCount }, (_, i) => [base + i, `SKU-${int(r, 10, 99)}`, pick(r, PRODUCTS)]);
    const clash = bad === 0 ? 1 : 0;
    rows[bad][0] = rows[clash][0];
    return {
      prompt: "Primary keys must be unique. Which row breaks that?",
      columns: ["id", "sku", "name"],
      rows,
      badRow: bad,
      because: `id ${rows[bad][0]} already belongs to row ${clash + 1}.`,
    };
  }

  if (defect === "outlier") {
    const nom = int(r, 90, 160);
    const rows = Array.from({ length: rowCount }, (_, i) => {
      const units = i === bad ? nom * 10 + int(r, 0, 30) : nom + int(r, -12, 12);
      return [MONTHS[i], units, units * 90];
    });
    return {
      prompt: "One month's figures are a clear outlier from a units error. Which row?",
      columns: ["month", "units", "revenue"],
      rows,
      badRow: bad,
      because: `${rows[bad][0]} units (${rows[bad][1]}) is ~10x its neighbours — a trailing zero slipped in.`,
    };
  }

  if (defect === "bad_pct") {
    const rows = Array.from({ length: rowCount }, (_, i) => [
      pick(r, ["Search", "Social", "Email", "Display", "Video"]),
      int(r, 200, 2000),
      i === bad ? int(r, 120, 260) + r() : Math.round((0.3 + r() * 4) * 10) / 10,
    ]);
    return {
      prompt: "A rate column has an impossible value. Which row?",
      columns: ["channel", "clicks", "ctr_pct"],
      rows: rows.map((x) => [x[0], x[1], typeof x[2] === "number" ? Math.round((x[2] as number) * 10) / 10 : x[2]]),
      badRow: bad,
      because: `A click-through rate of ${Math.round((rows[bad][2] as number) * 10) / 10}% is impossible — clicks can't exceed impressions.`,
    };
  }

  // total_mismatch
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const sub = int(r, 40, 220);
    const tax = Math.round(sub * 0.2);
    const total = i === bad ? sub + tax + int(r, 8, 40) : sub + tax;
    return [`INV-${i + 1}`, sub, tax, total];
  });
  return {
    prompt: "One invoice's total doesn't add up. Which row?",
    columns: ["invoice", "subtotal", "tax", "total"],
    rows,
    badRow: bad,
    because: `${rows[bad][1]} + ${rows[bad][2]} = ${(rows[bad][1] as number) + (rows[bad][2] as number)}, not ${rows[bad][3]}.`,
  };
}

/* ------------------------------------------------------------- Pivot Puzzle -- */
const DIMS = [
  { col: "region", vals: ["North", "South", "East", "West"] },
  { col: "team", vals: ["Alpha", "Bravo", "Charlie"] },
  { col: "channel", vals: ["Web", "Store", "Partner"] },
  { col: "stage", vals: ["Open", "Won", "Lost"] },
];
const AGGS = ["sum", "count", "avg", "max"] as const;

export function pivotRound(n: number): PivotRound {
  if (n <= PIVOT_AUTHORED) return PIVOT_ROUNDS[n - 1];
  const r = rng(n * 2654435761);
  const dim = pick(r, DIMS);
  const agg = pick(r, AGGS);
  const measure = pick(r, ["revenue", "value", "score", "amount"]);
  const labelCol = pick(r, ["rep", "deal", "item", "order"]);
  const rowN = int(r, 5, 8);
  const cols = [dim.col, labelCol, measure];
  const rows: (string | number)[][] = Array.from({ length: rowN }, (_, i) => [
    pick(r, dim.vals),
    `${labelCol[0]}${i + 1}`,
    int(r, 10, 200),
  ]);
  // compute expected
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const k = String(row[0]);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(agg === "count" ? 1 : (row[2] as number));
  }
  const expect: [string, number][] = [];
  for (const [k, v] of buckets) {
    let out: number;
    if (agg === "count") out = v.length;
    else if (agg === "sum") out = v.reduce((a, b) => a + b, 0);
    else if (agg === "avg") out = v.reduce((a, b) => a + b, 0) / v.length;
    else out = Math.max(...v);
    expect.push([k, Math.round(out * 100) / 100]);
  }
  expect.sort((a, b) => a[0].localeCompare(b[0]));
  const scene = pick(r, [
    "The ops lead wants a summary for the weekly review.",
    "Finance asked for this cut before the board deck.",
    "You're building a dashboard tile and need the right rollup.",
    "A stakeholder emailed asking for exactly this number.",
  ]);
  const verb = agg === "count" ? "the number of records" : `the ${agg} of ${measure}`;
  return {
    prompt: `${scene} Rebuild ${verb} per ${dim.col} from the raw rows.`,
    columns: cols,
    rows,
    groupBy: dim.col,
    valueField: agg === "count" ? labelCol : measure,
    agg,
    expect,
  };
}

/* --------------------------------------------------------- Chart Critiquer -- */
type Flaw =
  | "truncated_axis"
  | "wrong_type"
  | "cherry_picked"
  | "dual_axis"
  | "too_many_slices";

const FLAW_LABEL: Record<Flaw, string> = {
  truncated_axis: "Truncated y-axis",
  wrong_type: "Wrong chart type",
  cherry_picked: "Cherry-picked range",
  dual_axis: "Misleading dual axis",
  too_many_slices: "Pie with too many slices",
};
const DISTRACTORS = ["Missing data labels", "Too many colours", "3D effect", "Unlabelled log scale", "No legend"];

export function critiqueRound(n: number): CritiqueRound {
  if (n <= CRITIQUE_AUTHORED) return CRITIQUE_ROUNDS[n - 1];
  const r = rng(n * 40503);
  const flaw = pick(r, [
    "truncated_axis",
    "wrong_type",
    "cherry_picked",
    "dual_axis",
    "too_many_slices",
  ] as Flaw[]);
  const labels = pick(r, [
    ["Q1", "Q2", "Q3", "Q4"],
    ["Jan", "Feb", "Mar", "Apr"],
    ["2020", "2021", "2022", "2023"],
    ["Wk1", "Wk2", "Wk3", "Wk4"],
  ]);

  let series: { label: string; value: number }[];
  let yStart = 0;
  let caption: string;
  let explain: string;

  if (flaw === "truncated_axis") {
    const base = int(r, 90, 200);
    series = labels.map((l) => ({ label: l, value: base + int(r, 1, 9) }));
    yStart = base;
    caption = `"Huge growth this period!"`;
    explain = `The y-axis starts at ${yStart}, not 0, so a small change looks dramatic. Bar axes start at zero.`;
  } else if (flaw === "wrong_type") {
    series = labels.map((l) => ({ label: l, value: int(r, 20, 90) }));
    caption = "Four separate periods drawn as one smooth line, no markers.";
    explain = "A smooth line implies continuous data between points. For discrete periods use bars or a marked line.";
  } else if (flaw === "cherry_picked") {
    const good = [int(r, 60, 90), int(r, 100, 140)];
    series = [
      { label: labels[0], value: good[0] },
      { label: labels[labels.length - 1], value: good[1] },
    ];
    caption = "Only the first and last periods are shown — the dips in between are dropped.";
    explain = "Selecting only the favourable endpoints hides what happened in between. Show the full range.";
  } else if (flaw === "dual_axis") {
    const b = int(r, 40, 80);
    series = labels.map((l) => ({ label: l, value: b + int(r, -3, 3) }));
    caption = "Two metrics on separate hidden y-axes, scaled to overlap perfectly.";
    explain = "Independent y-axes can be scaled to manufacture a correlation. Use one axis or an index.";
  } else {
    series = labels.map((l) => ({ label: l, value: int(r, 8, 24) }));
    caption = "A pie chart split into 11 thin wedges.";
    explain = "Pies get unreadable past ~5 slices. A ranked bar chart compares many categories far better.";
  }

  // build 4 options: the right label + 3 distractors, shuffled
  const opts = [FLAW_LABEL[flaw], ...[...DISTRACTORS].sort(() => r() - 0.5).slice(0, 3)];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return {
    title: pick(r, ["Revenue", "Sign-ups", "Market share", "Engagement", "Growth"]),
    series,
    yStart,
    caption,
    options: opts,
    answer: opts.indexOf(FLAW_LABEL[flaw]),
    explain,
  };
}
