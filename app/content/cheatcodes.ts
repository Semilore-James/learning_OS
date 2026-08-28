/* ============================================================================
   Cheatcodes — quick reference, in-app (PRD section 11). Two tabs: SQL, Excel.
   Each section is a list of blocks: a label, a code / formula snippet with a
   copy button, and an optional note. The JOIN section renders Venn diagrams
   (handled in the component).
   ========================================================================== */

export interface CheatBlock {
  label: string;
  code: string;
  note?: string;
  lang?: "sql" | "excel" | "text";
}

export interface CheatSection {
  id: string;
  title: string;
  blocks: CheatBlock[];
  /** component renders the JOIN Venn diagrams for this section */
  diagram?: "joins";
}

export const SQL_SECTIONS: CheatSection[] = [
  {
    id: "select",
    title: "SELECT patterns",
    blocks: [
      { label: "Pick columns, filter, sort, limit", lang: "sql", code: "SELECT col_a, col_b\nFROM table_name\nWHERE col_a > 100\nORDER BY col_b DESC\nLIMIT 20;" },
      { label: "Distinct values", lang: "sql", code: "SELECT DISTINCT country\nFROM customers;" },
      { label: "Alias a column or a calculation", lang: "sql", code: "SELECT\n  price * quantity AS line_total,\n  first_name || ' ' || last_name AS full_name\nFROM order_items;" },
      { label: "Filter helpers", lang: "sql", code: "WHERE age BETWEEN 25 AND 34\nWHERE city IN ('Lagos', 'Abuja')\nWHERE name LIKE 'A%'\nWHERE deleted_at IS NULL" },
    ],
  },
  {
    id: "joins",
    title: "JOIN patterns",
    diagram: "joins",
    blocks: [
      { label: "INNER JOIN — only matching rows", lang: "sql", code: "SELECT o.id, c.name\nFROM orders o\nINNER JOIN customers c ON c.id = o.customer_id;" },
      { label: "LEFT JOIN — all left rows, NULLs where no match", lang: "sql", code: "SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;" },
      { label: "Find rows with NO match (anti-join)", lang: "sql", code: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;   -- customers who never ordered" },
      { label: "FULL OUTER JOIN — everything from both sides", lang: "sql", code: "SELECT *\nFROM a\nFULL OUTER JOIN b ON b.key = a.key;" },
    ],
  },
  {
    id: "aggregates",
    title: "Aggregates & GROUP BY",
    blocks: [
      { label: "Count, sum, average per group", lang: "sql", code: "SELECT\n  category,\n  COUNT(*)          AS n,\n  SUM(amount)       AS total,\n  AVG(amount)       AS avg_amount\nFROM sales\nGROUP BY category;" },
      { label: "Filter groups (after aggregation)", lang: "sql", code: "GROUP BY category\nHAVING COUNT(*) > 10", note: "WHERE filters rows before grouping; HAVING filters groups after." },
      { label: "Count distinct", lang: "sql", code: "SELECT COUNT(DISTINCT customer_id) AS buyers\nFROM orders;" },
    ],
  },
  {
    id: "window",
    title: "Window functions",
    blocks: [
      { label: "Row number / rank within a group", lang: "sql", code: "SELECT\n  name, department, salary,\n  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,\n  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk\nFROM employees;" },
      { label: "Running total", lang: "sql", code: "SELECT\n  order_date, amount,\n  SUM(amount) OVER (ORDER BY order_date\n                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total\nFROM orders;" },
      { label: "Compare to previous / next row", lang: "sql", code: "SELECT\n  month, revenue,\n  LAG(revenue)  OVER (ORDER BY month) AS prev_month,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly;" },
    ],
  },
  {
    id: "cte",
    title: "CTEs (WITH)",
    blocks: [
      { label: "Name a subquery to keep it readable", lang: "sql", code: "WITH monthly AS (\n  SELECT date_trunc('month', order_date) AS month,\n         SUM(amount) AS revenue\n  FROM orders\n  GROUP BY 1\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change\nFROM monthly\nORDER BY month;" },
    ],
  },
  {
    id: "string-date",
    title: "String & date functions",
    blocks: [
      { label: "Strings", lang: "sql", code: "UPPER(x), LOWER(x)\nTRIM(x)              -- strip whitespace\nLENGTH(x)\nSUBSTRING(x FROM 1 FOR 3)\nREPLACE(x, 'old', 'new')\nx || y              -- concatenate (Postgres/SQLite)\nCONCAT(x, y)        -- concatenate (MySQL/SQL Server)" },
      { label: "Dates", lang: "sql", code: "CURRENT_DATE, NOW()\nDATE_TRUNC('month', ts)         -- first day of the month\nEXTRACT(YEAR FROM ts)\nts + INTERVAL '7 days'\nAGE(end_date, start_date)       -- Postgres" },
    ],
  },
  {
    id: "nulls",
    title: "NULL handling",
    blocks: [
      { label: "Test for NULL (never use = NULL)", lang: "sql", code: "WHERE col IS NULL\nWHERE col IS NOT NULL" },
      { label: "Replace NULL with a default", lang: "sql", code: "COALESCE(discount, 0)            -- first non-null value\nNULLIF(a, b)                     -- NULL if a = b, else a" },
      { label: "CASE for conditional values", lang: "sql", code: "SELECT\n  CASE\n    WHEN score >= 90 THEN 'A'\n    WHEN score >= 80 THEN 'B'\n    ELSE 'C'\n  END AS grade\nFROM results;" },
    ],
  },
  {
    id: "formatting",
    title: "Formatting standards",
    blocks: [
      {
        label: "Readable SQL",
        lang: "sql",
        code: "SELECT\n  c.name,\n  COUNT(o.id) AS order_count,\n  SUM(o.amount) AS lifetime_value\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id\nWHERE c.created_at >= '2025-01-01'\nGROUP BY c.name\nHAVING COUNT(o.id) > 0\nORDER BY lifetime_value DESC;",
        note: "Keywords on their own lines, one column per line, indent JOIN conditions, alias with AS, uppercase keywords.",
      },
    ],
  },
];

export const EXCEL_SECTIONS: CheatSection[] = [
  {
    id: "shortcuts",
    title: "Essential shortcuts",
    blocks: [
      { label: "Navigation & selection (Windows)", lang: "text", code: "Ctrl + Arrow      jump to edge of data\nCtrl + Shift + Arrow   select to edge\nCtrl + A          select the whole table\nCtrl + Home       back to A1\nAlt + =           AutoSum" },
      { label: "Editing", lang: "text", code: "F2               edit the active cell\nF4               toggle $ absolute references / repeat last action\nCtrl + D / R      fill down / fill right\nCtrl + ;         insert today's date\nAlt + Enter      line break inside a cell" },
      { label: "Mac equivalents", lang: "text", code: "Cmd replaces Ctrl for most\nCmd + Arrow, Cmd + Shift + Arrow, etc.\nF4 absolute-reference toggle is the same" },
    ],
  },
  {
    id: "formulas",
    title: "Most-used formulas",
    blocks: [
      { label: "Lookups", lang: "excel", code: "=VLOOKUP(key, table, col_index, FALSE)\n=XLOOKUP(key, lookup_range, return_range, \"not found\")\n=INDEX(return_range, MATCH(key, lookup_range, 0))", note: "INDEX-MATCH and XLOOKUP survive column insertion; VLOOKUP does not." },
      { label: "Conditional counts and sums", lang: "excel", code: "=COUNTIF(range, \">100\")\n=SUMIF(criteria_range, \"Lagos\", sum_range)\n=SUMIFS(sum_range, range1, crit1, range2, crit2)\n=COUNTIFS(range1, crit1, range2, crit2)" },
      { label: "IF and friends", lang: "excel", code: "=IF(A2>0, \"positive\", \"non-positive\")\n=IFERROR(A2/B2, 0)\n=IFS(A2>90,\"A\", A2>80,\"B\", TRUE,\"C\")" },
      { label: "Text", lang: "excel", code: "=TRIM(A2)            remove extra spaces\n=LEFT(A2, 3) / RIGHT / MID\n=TEXTSPLIT(A2, \",\")   split into columns\n=A2 & \" \" & B2        concatenate" },
    ],
  },
  {
    id: "pivot",
    title: "Pivot table quick-build",
    blocks: [
      {
        label: "Steps",
        lang: "text",
        code: "1. Click any cell in the data.\n2. Insert > PivotTable > OK.\n3. Drag a category field to Rows.\n4. Drag a number field to Values (defaults to SUM).\n5. Click the Values field > Value Field Settings to switch\n   SUM / COUNT / AVERAGE, or to show % of column total.\n6. Drag a second field to Columns for a cross-tab.\n7. Right-click a row label > Group to bucket dates or numbers.",
      },
    ],
  },
  {
    id: "power-query",
    title: "Power Query transforms",
    blocks: [
      { label: "Where it lives", lang: "text", code: "Data > Get Data (or Get & Transform).\nEach step is recorded; you can reorder or delete steps." },
      { label: "Common steps", lang: "text", code: "Remove Columns / Choose Columns\nFilter Rows\nChange Type (set each column's data type first)\nSplit Column by delimiter\nReplace Values\nGroup By  (like a pivot, but reusable)\nMerge Queries  (a JOIN)\nAppend Queries  (stack tables)\nUnpivot Columns  (wide -> tall, fixes cross-tab data)" },
    ],
  },
  {
    id: "conditional-formatting",
    title: "Conditional formatting",
    blocks: [
      { label: "Rules", lang: "text", code: "Home > Conditional Formatting.\nHighlight Cells Rules      >, <, between, text contains\nTop/Bottom Rules           top 10, above average\nData Bars / Color Scales    in-cell heatmap\nNew Rule > Use a formula:\n  =$C2<0            highlight the whole row where C is negative" },
    ],
  },
  {
    id: "chart-selector",
    title: "Which chart?",
    blocks: [
      {
        label: "Pick by what the data is",
        lang: "text",
        code: "Compare categories        -> bar (horizontal if labels are long)\nChange over time          -> line\nPart of a whole           -> stacked bar (avoid pie past ~4 slices)\nRelationship between two   -> scatter\nDistribution of one number -> histogram\nOne big number            -> just the number, large, with context",
      },
    ],
  },
  {
    id: "cleaning",
    title: "Data cleaning",
    blocks: [
      { label: "Quick wins", lang: "text", code: "Data > Remove Duplicates\nData > Text to Columns  (split a stuck-together column)\n=TRIM(CLEAN(A2))        strip spaces and non-printing chars\nFind & Replace           standardise 'NG' / 'Nigeria' / 'nigeria'\nCtrl + T                 make it a real Table (headers, filters, expands)" },
    ],
  },
];
