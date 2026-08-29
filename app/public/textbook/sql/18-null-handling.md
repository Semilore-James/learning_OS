# NULL handling (IS NULL, COALESCE, NULLIF)

## The one-sentence version

`NULL` means "unknown", not "zero" or "empty", so it needs its own operators (`IS NULL`), it silently drops out of comparisons and some aggregates, and `COALESCE` / `NULLIF` are how you convert it to and from real values.

## What it is

`NULL` is the absence of a value. A missing birth date, an unset discount code, the previous row that does not exist. It is not `0`, not `''`, not `false`. It is "we do not know".

```sql
SELECT * FROM customers WHERE phone IS NULL;      -- correct
SELECT * FROM customers WHERE phone = NULL;       -- returns nothing, ever
```

## Why it exists

Databases have to represent "no data here" distinctly from a real value, because "average salary where salary is unknown" and "average salary where salary is zero" are different questions. The cost of that correctness is that `NULL` behaves in ways that surprise people, and those surprises cause wrong numbers in reports.

## How it works

**Comparisons with `NULL` return `NULL`, not `true` or `false`.** `NULL = NULL` is `NULL`. `NULL > 5` is `NULL`. A `WHERE` clause only keeps rows where the condition is `true`, so any row that evaluates to `NULL` is dropped. This is why `WHERE phone = NULL` returns nothing: you must use `IS NULL` / `IS NOT NULL`.

**`NOT IN` with a `NULL` in the list returns nothing.** `x NOT IN (1, 2, NULL)` is never `true`. If the subquery behind a `NOT IN` can produce a `NULL`, the whole thing breaks silently. Use `NOT EXISTS` instead, which is `NULL`-safe.

**Aggregates ignore `NULL`.** `COUNT(column)` skips nulls (`COUNT(*)` does not). `AVG(column)` divides by the count of non-null values. `SUM` of all-null is `NULL`, not `0`.

**`NULL` in arithmetic and concatenation is contagious.** `100 + NULL` is `NULL`. `'Mr ' || NULL` is `NULL` (with `||`). One missing value can wipe out a computed column.

**The tools to fix it:**

- `COALESCE(a, b, c)` returns the first non-null argument. `COALESCE(discount, 0)` turns missing discounts into zero so the math works. `COALESCE(nickname, first_name, 'friend')` is a fallback chain.
- `NULLIF(a, b)` returns `NULL` if `a = b`, else `a`. The classic use is `x / NULLIF(y, 0)` to turn a divide-by-zero into a `NULL` result instead of an error.
- `IS DISTINCT FROM` is a `NULL`-safe `<>`. `a IS DISTINCT FROM b` is `true` when one is `NULL` and the other is not, which plain `<>` cannot tell you.

## When you use it

Every join on a nullable column. Every computed column that adds or concatenates. Every `NOT IN`. Every division. Any time a total looks lower than it should and you suspect nulls are being skipped.

## A worked example

"Average order value per customer, counting customers with no orders as 0." Tables: `customers` (`id`), `orders` (`customer_id`, `total`).

```sql
SELECT
  c.id,
  COALESCE(AVG(o.total), 0)      AS avg_order_value,
  COUNT(o.id)                    AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
```

The `LEFT JOIN` keeps customers with no orders; their `o.total` is `NULL`. `AVG` of nothing is `NULL`, so `COALESCE(..., 0)` reports it as `0`. `COUNT(o.id)` correctly shows `0` for them because `COUNT` of a column skips the `NULL`.

> **Try This**
> Case 05 (Fintech Churn) has nullable columns in the transactions data. Run a `COUNT(*)` and a `COUNT(the_column)` side by side, see the gap, and decide for each column whether the nulls should become `0` or stay unknown.
