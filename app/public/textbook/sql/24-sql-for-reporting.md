# SQL for reporting

## The one-sentence version

A reporting query has a different job from an exploratory one: it feeds a dashboard or a scheduled email, so it has to be stable, correctly shaped for the tool, and cheap enough to run on every refresh.

## What it is

The query behind a chart, a KPI tile, or a "numbers as of this morning" email. It usually returns a small, tidy result: one row per date or per category, a fixed set of columns, sorted.

## Why it exists

Exploratory SQL is written once, read by you, and thrown away. Reporting SQL runs unattended, maybe hourly, and other people make decisions from its output without seeing the query. That changes what "good" means: predictable structure, no surprises when the data grows, and a shape the BI tool can consume directly.

## How it works

**Return long, not wide.** BI tools (Looker, Power BI, Metabase, Tableau) want one row per observation with category columns and a value column:

```sql
SELECT day, region, SUM(total) AS revenue
FROM orders
GROUP BY day, region
ORDER BY day, region;
```

Let the tool pivot `region` into series. Do not hand-build `revenue_north`, `revenue_south` columns unless the consumer specifically needs them.

**Make date ranges relative and half-open.**

```sql
WHERE created_at >= date_trunc('month', now()) - interval '12 months'
  AND created_at <  date_trunc('month', now())
```

Hardcoded dates rot. `BETWEEN` on timestamps drops the last day.

**Fill gaps so lines do not lie.** If a category has no rows on a day, the chart skips it and the trend looks wrong. Left-join against a full date spine:

```sql
WITH days AS (
  SELECT generate_series(
    date_trunc('day', now()) - interval '29 days',
    date_trunc('day', now()),
    interval '1 day'
  )::date AS day
)
SELECT d.day, COALESCE(SUM(o.total), 0) AS revenue
FROM days d
LEFT JOIN orders o ON o.created_at::date = d.day
GROUP BY d.day
ORDER BY d.day;
```

**Define the metric once.** If "active user" or "revenue" appears in five reports, put the definition in a view or a dbt model and point every report at it. Five slightly different definitions is how two dashboards end up disagreeing.

**Round and label at the edge, not in the core.** Keep full precision in the calculation; round in the final `SELECT`. Name columns the way they should appear (`revenue`, not `sum_total_2`).

**Watch the cost.** A report that scans a huge table every 15 minutes is a real bill. Aggregate into a summary table on a schedule and have the dashboard read the summary.

## When you use it

Every time a query graduates from "I'm looking into something" to "this powers a thing other people look at". The moment you paste SQL into a BI tool's query box, switch into this mode.

## A worked example

A weekly revenue email needs: last 8 weeks, revenue and order count per week, week-over-week change.

```sql
WITH weekly AS (
  SELECT
    date_trunc('week', created_at) AS week,
    SUM(total) AS revenue,
    COUNT(*)   AS orders
  FROM orders
  WHERE created_at >= date_trunc('week', now()) - interval '8 weeks'
    AND created_at <  date_trunc('week', now())
  GROUP BY 1
)
SELECT
  week,
  revenue,
  orders,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY week))
    / NULLIF(LAG(revenue) OVER (ORDER BY week), 0) * 100,
    1
  ) AS wow_change_pct
FROM weekly
ORDER BY week;
```

Relative range, half-open, one row per week, the change computed with `LAG` and guarded against divide-by-zero. Drop it into a scheduled query and it keeps working next quarter.

> **Try This**
> Take your best query from any completed case and harden it for reporting: relative dates, a date spine to fill gaps, long format, rounded output. That hardened version is what goes in a portfolio, not the exploratory draft.
