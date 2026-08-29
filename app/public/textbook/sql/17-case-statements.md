# CASE statements

## The one-sentence version

`CASE` is an if/then/else you can put inside any `SELECT`, `WHERE`, `ORDER BY` or aggregate, so you can bucket values, relabel codes, and count two things at once in a single query.

## What it is

```sql
SELECT
  order_id,
  total,
  CASE
    WHEN total >= 500 THEN 'large'
    WHEN total >= 100 THEN 'medium'
    ELSE 'small'
  END AS order_size
FROM orders;
```

Each row is tested against the `WHEN` conditions top to bottom. The first one that is true decides the output. If none match, you get the `ELSE` value, or `NULL` if there is no `ELSE`.

## Why it exists

Data stores codes and raw numbers. Reports need labels and buckets. `CASE` does that translation in the query so you are not maintaining a lookup by hand: `1` becomes `'active'`, a revenue number becomes a tier, a messy set of status strings collapses into three clean categories.

## How it works

**Searched form** (shown above) — each `WHEN` is a full condition. Most flexible.

**Simple form** — when you are just matching one expression against values:

```sql
CASE region_code
  WHEN 'NA' THEN 'North America'
  WHEN 'EU' THEN 'Europe'
  ELSE 'Other'
END
```

**Order matters.** Conditions are checked in sequence and the first match wins. If you write the `>= 100` line before the `>= 500` line, nothing is ever 'large'.

**`CASE` inside an aggregate** is the pattern that does the most work. It lets one query total several things at once:

```sql
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*)                                              AS all_orders,
  COUNT(CASE WHEN status = 'refunded' THEN 1 END)       AS refunds,
  SUM(CASE WHEN status = 'refunded' THEN total ELSE 0 END) AS refund_value
FROM orders
GROUP BY 1;
```

`COUNT(CASE WHEN ... THEN 1 END)` counts only the rows that match, because `COUNT` ignores `NULL` and the missing `ELSE` returns `NULL`. This is called a conditional aggregate, and it is how you build a report with many columns from one scan of the table.

**`CASE` in `ORDER BY`** gives a custom sort order:

```sql
ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
```

## When you use it

Bucketing a continuous number into tiers. Turning codes into readable labels. Building a "pivot" where each category becomes its own column. Counting or summing a subset without a separate query. Forcing a non-alphabetical sort.

## A worked example

"One row per month with total revenue split into new-customer and returning-customer revenue." Tables: `orders` (`customer_id`, `created_at`, `total`), and assume a column `is_first_order` (boolean) exists.

```sql
SELECT
  date_trunc('month', created_at) AS month,
  SUM(total)                                                    AS total_revenue,
  SUM(CASE WHEN is_first_order THEN total ELSE 0 END)           AS new_customer_revenue,
  SUM(CASE WHEN NOT is_first_order THEN total ELSE 0 END)       AS returning_revenue
FROM orders
GROUP BY 1
ORDER BY 1;
```

One pass over `orders`, three totals, split by a condition. Doing this with three separate queries and joining them would be slower and longer.

> **Try This**
> Case 04 (Customer Order Analysis) asks for revenue by segment. Build the segments with a `CASE` on lifetime spend, then produce the whole breakdown as conditional `SUM`s in one query.
