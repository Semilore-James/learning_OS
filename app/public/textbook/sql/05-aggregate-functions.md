# Aggregate functions

## The one-sentence version

An aggregate function takes many rows and returns one number, so `COUNT`, `SUM`, `AVG`, `MIN` and `MAX` turn a table into a summary.

## What it is

Most of what you have done so far returns one output row per input row. An aggregate function does the opposite: it collapses a whole set of rows into a single value.

```sql
SELECT COUNT(*)      AS total_customers,
       AVG(order_value) AS average_order,
       MAX(order_value) AS biggest_order
FROM orders;
```

One row back, three numbers. `COUNT(*)` counts rows. `AVG`, `SUM`, `MIN`, `MAX` do what their names say, on a numeric column.

## Why it exists

Nobody wants to read a million order rows. They want to know: how many, how much on average, the largest, the total. Aggregates compute those directly in the database, over the full dataset, without you exporting anything.

## How it works

`COUNT` has three forms and the difference matters:

- `COUNT(*)` counts every row.
- `COUNT(column)` counts rows where that column is **not NULL**.
- `COUNT(DISTINCT column)` counts the distinct non-NULL values.

```sql
SELECT COUNT(*)                    AS all_rows,
       COUNT(discount_code)        AS rows_with_a_code,
       COUNT(DISTINCT discount_code) AS distinct_codes
FROM orders;
```

`SUM` and `AVG` ignore NULLs too. That is usually what you want, but be aware: `AVG` divides by the count of non-NULL values, not by the total row count. If half your rows have a NULL rating, `AVG(rating)` is the average of the ratings that exist, not "average assuming the missing ones are zero".

An aggregate with no `GROUP BY` treats the entire (filtered) table as one group. Add `WHERE` first and the aggregate runs on just those rows:

```sql
SELECT SUM(amount) AS refunded_total
FROM transactions
WHERE type = 'refund';
```

You cannot mix an aggregate and a plain column in the same `SELECT` without a `GROUP BY`. `SELECT name, COUNT(*)` is an error, because the database does not know which name to show next to the count. That is exactly the problem `GROUP BY` solves, and it is the next chapter.

## When you use it

Whenever the answer is a number about a set of rows: a total, a headcount, an average, an extreme. It is the first thing you reach for after filtering.

## A worked example

"What was our refund rate last month?" You have a `transactions` table with `type` ('sale' or 'refund'), `amount`, and `created_at`.

Refund rate is refund amount over sale amount. Two aggregates, both filtered to last month:

```sql
SELECT
  SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) AS refunds,
  SUM(CASE WHEN type = 'sale'   THEN amount ELSE 0 END) AS sales
FROM transactions
WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01';
```

`CASE` inside `SUM` is a common move: it lets one query total two different things at once. You divide `refunds` by `sales` afterwards.

> **Try This**
> SQL Dojo level 7 is a single COUNT. Then try Case 01 (Retail Sales Audit) — the "what stands out" step needs totals and averages by store.
