/* ============================================================================
   Content for the three non-SQL games. All pure data — the components render
   and score it. Rounds are ordered easiest-first; each cleared round is one
   "level" for recordGameScore.
   ========================================================================== */

/* ---- Data Detective : spot the data-quality defect in a small table -------- */
export interface DetectiveRound {
  prompt: string;
  columns: string[];
  rows: (string | number)[][];
  /** index of the row containing the defect */
  badRow: number;
  because: string;
}

export const DETECTIVE_ROUNDS: DetectiveRound[] = [
  {
    prompt: "One customer record is impossible. Which row?",
    columns: ["id", "name", "signup_date", "age"],
    rows: [
      [1, "Ada", "2023-01-05", 34],
      [2, "Grace", "2023-02-11", 29],
      [3, "Alan", "2023-02-30", 41],
      [4, "Katherine", "2023-03-15", 38],
    ],
    badRow: 2,
    because: "February never has 30 days — 2023-02-30 is not a real date.",
  },
  {
    prompt: "A quantity column should never allow this. Which row?",
    columns: ["order_id", "product", "qty", "unit_price"],
    rows: [
      [11, "Keyboard", 2, 89],
      [12, "Monitor", 1, 240],
      [13, "Hub", -3, 45],
      [14, "Webcam", 1, 60],
    ],
    badRow: 2,
    because: "A negative quantity (-3) can't be shipped — likely a bad return adjustment.",
  },
  {
    prompt: "Primary keys must be unique. Which row breaks that?",
    columns: ["id", "sku", "name"],
    rows: [
      [101, "KB-01", "Keyboard"],
      [102, "MN-27", "Monitor"],
      [103, "HB-0C", "USB-C Hub"],
      [102, "ST-01", "Laptop Stand"],
    ],
    badRow: 3,
    because: "id 102 already belongs to the Monitor row — the id is duplicated.",
  },
  {
    prompt: "One revenue figure is a clear outlier from a units error. Which row?",
    columns: ["month", "units", "revenue"],
    rows: [
      ["Jan", 120, 10800],
      ["Feb", 132, 11880],
      ["Mar", 1280, 115200],
      ["Apr", 141, 12690],
    ],
    badRow: 2,
    because: "March units (1280) is ~10x its neighbours — a trailing zero slipped in.",
  },
  {
    prompt: "A percentage column has an invalid value. Which row?",
    columns: ["campaign", "clicks", "ctr_pct"],
    rows: [
      ["Search", 900, 3.1],
      ["Social", 1200, 2.4],
      ["Email", 400, 140.0],
      ["Display", 2200, 0.6],
    ],
    badRow: 2,
    because: "A click-through rate of 140% is impossible — clicks can't exceed impressions.",
  },
  {
    prompt: "One row's total doesn't add up. Which row?",
    columns: ["invoice", "subtotal", "tax", "total"],
    rows: [
      ["A-1", 100, 20, 120],
      ["A-2", 50, 10, 60],
      ["A-3", 80, 16, 132],
      ["A-4", 200, 40, 240],
    ],
    badRow: 2,
    because: "80 + 16 = 96, not 132 — the total column is wrong for invoice A-3.",
  },
];

/* ---- Pivot Puzzle : choose row field / value field / aggregation ---------- */
export interface PivotRound {
  prompt: string;
  columns: string[];
  rows: (string | number)[][];
  /** correct answers */
  groupBy: string;
  valueField: string;
  agg: "sum" | "count" | "avg" | "max";
  /** expected pivot output, sorted by group label */
  expect: [string, number][];
}

export const PIVOT_ROUNDS: PivotRound[] = [
  {
    prompt: "Total revenue per region.",
    columns: ["region", "rep", "revenue"],
    rows: [
      ["North", "Sam", 100],
      ["North", "Kai", 150],
      ["South", "Lee", 200],
      ["South", "Ivy", 50],
      ["West", "Ron", 90],
    ],
    groupBy: "region",
    valueField: "revenue",
    agg: "sum",
    expect: [
      ["North", 250],
      ["South", 250],
      ["West", 90],
    ],
  },
  {
    prompt: "Number of deals per stage.",
    columns: ["stage", "deal", "amount"],
    rows: [
      ["Won", "D1", 10],
      ["Won", "D2", 20],
      ["Lost", "D3", 5],
      ["Open", "D4", 8],
      ["Open", "D5", 12],
      ["Open", "D6", 3],
    ],
    groupBy: "stage",
    valueField: "deal",
    agg: "count",
    expect: [
      ["Lost", 1],
      ["Open", 3],
      ["Won", 2],
    ],
  },
  {
    prompt: "Average score per team.",
    columns: ["team", "player", "score"],
    rows: [
      ["A", "p1", 10],
      ["A", "p2", 20],
      ["B", "p3", 30],
      ["B", "p4", 50],
    ],
    groupBy: "team",
    valueField: "score",
    agg: "avg",
    expect: [
      ["A", 15],
      ["B", 40],
    ],
  },
  {
    prompt: "Highest single order per channel.",
    columns: ["channel", "order", "value"],
    rows: [
      ["Web", "o1", 40],
      ["Web", "o2", 120],
      ["Store", "o3", 80],
      ["Store", "o4", 60],
    ],
    groupBy: "channel",
    valueField: "value",
    agg: "max",
    expect: [
      ["Store", 80],
      ["Web", 120],
    ],
  },
];

/* ---- Chart Critiquer : name the flaw in a described chart ----------------- */
export interface CritiqueRound {
  title: string;
  /** simple bar series for the mini preview */
  series: { label: string; value: number }[];
  yStart: number;
  caption: string;
  options: string[];
  answer: number;
  explain: string;
}

export const CRITIQUE_ROUNDS: CritiqueRound[] = [
  {
    title: "Quarterly revenue",
    series: [
      { label: "Q1", value: 102 },
      { label: "Q2", value: 104 },
      { label: "Q3", value: 103 },
      { label: "Q4", value: 106 },
    ],
    yStart: 100,
    caption: "“Revenue is exploding!”",
    options: ["Truncated y-axis", "Wrong chart type", "Missing data labels", "Too many colours"],
    answer: 0,
    explain:
      "The y-axis starts at 100, not 0, so a ~4% change looks like a huge climb. Start bar axes at zero.",
  },
  {
    title: "Market share by brand (12 slices)",
    series: [
      { label: "A", value: 22 },
      { label: "B", value: 18 },
      { label: "C", value: 14 },
      { label: "D", value: 11 },
    ],
    yStart: 0,
    caption: "A pie chart split into 12 thin wedges.",
    options: ["Truncated y-axis", "Pie with too many slices", "Log scale not labelled", "Cherry-picked dates"],
    answer: 1,
    explain:
      "Pies get unreadable past ~5 slices. A ranked bar chart compares many categories far better.",
  },
  {
    title: "Sign-ups over time",
    series: [
      { label: "Wk1", value: 30 },
      { label: "Wk2", value: 55 },
      { label: "Wk3", value: 40 },
      { label: "Wk4", value: 60 },
    ],
    yStart: 0,
    caption: "Four discrete weeks shown as a single smooth curve with no markers.",
    options: ["Should be a bar/point chart", "Truncated y-axis", "Dual axis", "3D effect"],
    answer: 0,
    explain:
      "A smooth line implies continuous data between points. For weekly counts, use bars or a marked line.",
  },
  {
    title: "Ad spend vs. revenue",
    series: [
      { label: "Jan", value: 50 },
      { label: "Feb", value: 52 },
      { label: "Mar", value: 51 },
      { label: "Apr", value: 53 },
    ],
    yStart: 0,
    caption: "Two lines on separate hidden y-axes, scaled so they overlap perfectly.",
    options: ["Misleading dual axis", "Truncated y-axis", "Too few data points", "Wrong colour order"],
    answer: 0,
    explain:
      "Independent y-axes can be scaled to manufacture a correlation. Show both on one axis or use an index.",
  },
  {
    title: "Annual growth",
    series: [
      { label: "2019", value: 80 },
      { label: "2020", value: 120 },
      { label: "2021", value: 95 },
      { label: "2022", value: 130 },
    ],
    yStart: 0,
    caption: "Chart shows only 2020 and 2022 — the down years are dropped.",
    options: ["Cherry-picked range", "Truncated y-axis", "Wrong chart type", "Missing legend"],
    answer: 0,
    explain: "Selecting only the favourable years hides the 2021 dip. Show the full time range.",
  },
];
