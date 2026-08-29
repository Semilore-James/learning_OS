# Window functions: SUM OVER, AVG OVER, PARTITION BY

## The one-sentence version

Putting `OVER (...)` after `SUM`, `AVG`, `COUNT`, `MIN` or `MAX` turns an aggregate into a running or group-wide total that appears on every row, so you can show a value and its share of the whole side by side.

## What it is

You already know `SUM(total)` with `GROUP BY` returns one number per group. `SUM(total) OVER (...)` returns that same total, but attached to every row, with the detail rows intact.

```sql
SELECT
  region,
  name,
  revenue,
  SUM(revenue) OVER (PARTITION BY region)            AS region_total,
  revenue / SUM(revenue) OVER (PARTITION BY region)  AS share_of_region
FROM customers;
```

Each customer row now carries its region's total and its own share of it. `GROUP BY` cannot do this without a join, because it throws the customer rows away.

## Why it exists

"What percent of the category does this product make up?" "Show me the running total of revenue by day." "How does this store compare to its region's average?" These need the detail row **and** the aggregate in the same place. The windowed aggregate is the clean way to do it.

## How it works

**Group-wide** (no `ORDER BY` in the `OVER`): the function uses every row in the partition.

```sql
AVG(score) OVER (PARTITION BY class_id)   -- the class average, on every student row
```

**Running / cumulative** (add `ORDER BY` in the `OVER`): the function uses every row from the start of the partition up to the current row.

```sql
SUM(revenue) OVER (ORDER BY day)                          -- running total across all days
SUM(revenue) OVER (PARTITION BY region ORDER BY day)      -- running total, restarting per region
```

That "up to the current row" behaviour is the default frame when you supply `ORDER BY`. You can widen it:

```sql
AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)   -- 7-day moving average
```

`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` is a sliding window of seven rows. This is how you build moving averages, which smooth a noisy daily line into a trend.

## When you use it

Share-of-total columns. Running totals and cumulative sums. Moving averages. Comparing a row to its group's mean or max. Anything a stakeholder would describe as "and show me how that stacks up against the total".

## A worked example

"For each day, show revenue, the running total for the month, and the 7-day moving average." Table: `daily_revenue` (`day`, `revenue`), one row per day.

```sql
SELECT
  day,
  revenue,
  SUM(revenue) OVER (
    PARTITION BY date_trunc('month', day)
    ORDER BY day
  ) AS month_to_date,
  ROUND(
    AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW),
    2
  ) AS moving_avg_7d
FROM daily_revenue
ORDER BY day;
```

The running total resets on the first of each month because of `PARTITION BY date_trunc('month', day)`. The moving average keeps sliding across month boundaries because its window has no partition.

> **Try This**
> In Case 09 (Subscription Revenue) or any case with a daily series, add a `month_to_date` column and a 7-day moving average. Then look at how differently the raw line and the smoothed line read.
