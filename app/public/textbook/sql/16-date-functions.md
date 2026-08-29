# Date and time functions

## The one-sentence version

Date functions let you truncate timestamps to a period, pull parts out of them, and do arithmetic with them, so "revenue by month" and "orders in the last 30 days" become one line each.

## What it is

Functions that work on `DATE`, `TIMESTAMP`, and interval values.

```sql
SELECT
  date_trunc('month', created_at) AS month,
  EXTRACT(dow FROM created_at)     AS day_of_week,
  created_at::date                 AS day,
  now() - created_at               AS age
FROM orders;
```

## Why it exists

Almost every business question has a time frame. "This quarter." "Year over year." "Within 7 days of signup." Timestamps are precise to the second, but people think in days, weeks, months. Date functions bridge that gap so you can group and filter by the period the stakeholder actually means.

## How it works

**Truncate to a period** — `date_trunc('month', ts)` returns the first instant of that month. Also `'day'`, `'week'`, `'quarter'`, `'year'`. This is how you get clean monthly buckets:

```sql
SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
FROM orders
GROUP BY 1
ORDER BY 1;
```

**Extract a part** — `EXTRACT(year FROM ts)`, `EXTRACT(month FROM ts)`, `EXTRACT(dow FROM ts)` (day of week, 0 = Sunday in Postgres). Returns a number. Use it to group by "day of week" regardless of which week.

**Arithmetic** — subtracting two timestamps gives an interval. Adding an interval shifts a date:

```sql
WHERE created_at >= now() - interval '30 days'
WHERE ship_date <= order_date + interval '2 days'
```

**Current time** — `now()` / `current_timestamp` (with time zone), `current_date` (just the date). Use these instead of hardcoding today.

**The half-open range rule** — to get "all of January" use `>= '2026-01-01' AND < '2026-02-01'`, not `BETWEEN '2026-01-01' AND '2026-01-31'`. `BETWEEN` on a timestamp misses everything after midnight on the 31st. Lower bound inclusive, upper bound exclusive, every time.

Time zones are the other trap. A `timestamp without time zone` has no offset attached, so the same value means different real moments in different places. If your data spans regions, store `timestamptz` and be explicit about which zone you report in.

## When you use it

Grouping anything by day, week, month, quarter. "Last N days" filters. Cohort analysis (bucket users by signup month). Measuring elapsed time between two events. Day-of-week or hour-of-day patterns.

## A worked example

"Weekly active customers for the last 12 weeks." Table: `events` (`customer_id`, `occurred_at`).

```sql
SELECT
  date_trunc('week', occurred_at)          AS week,
  COUNT(DISTINCT customer_id)              AS active_customers
FROM events
WHERE occurred_at >= date_trunc('week', now()) - interval '12 weeks'
GROUP BY 1
ORDER BY 1;
```

`date_trunc('week', ...)` snaps every event to the Monday of its week. `COUNT(DISTINCT customer_id)` counts each customer once per week even if they had 40 events. The `WHERE` keeps it to the last 12 full weeks.

> **Try This**
> In Case 09 (Subscription Revenue), build monthly revenue with `date_trunc('month', ...)`, then compare it to the same figure grouped by `EXTRACT(month FROM ...)` and explain to yourself why the second one is wrong for a multi-year dataset.
