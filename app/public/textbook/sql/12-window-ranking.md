# Window functions: ROW_NUMBER, RANK, DENSE_RANK

## The one-sentence version

A window function runs a calculation across a set of rows that are related to the current row, without collapsing them into one, so you can number, rank, and compare rows while still seeing every row.

## What it is

`GROUP BY` gives you one row per group. A window function keeps all the rows and adds a column computed over a "window" of them.

```sql
SELECT
  name,
  region,
  revenue,
  ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rank_in_region
FROM customers;
```

Every customer row is still there. The new column says where that customer sits in their region by revenue.

The `OVER (...)` clause is what makes it a window function. Inside it:

- `PARTITION BY region` splits the rows into groups (like `GROUP BY`, but the rows survive).
- `ORDER BY revenue DESC` sets the order the function walks the rows in.

## Why it exists

"Top 3 products per category." "Each customer's most recent order." "Where does this month rank against every other month?" These all need a per-row answer that depends on the other rows around it. Before window functions you did this with a self-join or a correlated subquery, which was slow and hard to read. `OVER (...)` does it in one pass.

## How it works

The three ranking functions differ only in how they handle ties:

| function | 1st | 2nd | tie at 2nd | next |
|---|---|---|---|---|
| `ROW_NUMBER()` | 1 | 2 | 3 (arbitrary) | 4 |
| `RANK()` | 1 | 2 | 2 | 4 (gap) |
| `DENSE_RANK()` | 1 | 2 | 2 | 3 (no gap) |

- `ROW_NUMBER()` always gives distinct integers. Use it to pick exactly one row per group (the "first" order, the "latest" login).
- `RANK()` leaves gaps after ties. Use it when the gap is meaningful, like standings where two people tie for 2nd and nobody is 3rd.
- `DENSE_RANK()` never leaves gaps. Use it to bucket into "top tier, second tier".

A window function is evaluated **after** `WHERE`, `GROUP BY`, and `HAVING`, but **before** the final `ORDER BY` and `LIMIT`. That is why you cannot filter on it directly:

```sql
-- ERROR: rank_in_region does not exist yet at WHERE
SELECT name, ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rank_in_region
FROM customers
WHERE rank_in_region <= 3;
```

Wrap it in a CTE or subquery and filter the outer query:

```sql
WITH ranked AS (
  SELECT name, region, revenue,
         ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rk
  FROM customers
)
SELECT * FROM ranked WHERE rk <= 3;
```

## When you use it

Any "top N per group" question. Any "keep only the latest row per key" cleanup. Any time you want a rank column sitting next to the raw numbers so a stakeholder can see both.

## A worked example

"Give me each customer's single most recent order." Table: `orders` (`id`, `customer_id`, `order_date`, `total`).

```sql
WITH numbered AS (
  SELECT
    id, customer_id, order_date, total,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS rn
  FROM orders
)
SELECT id, customer_id, order_date, total
FROM numbered
WHERE rn = 1;
```

`PARTITION BY customer_id` makes one window per customer. `ORDER BY order_date DESC` puts the newest first. The tiebreak on `id DESC` matters: if a customer has two orders on the same date, you still want a deterministic winner. `WHERE rn = 1` keeps just that row.

> **Try This**
> SQL Dojo, levels 9-12 lean on JOINs but the "latest per group" pattern shows up in Case 15 (SaaS Cohort Retention). Try rewriting a "most recent" subquery from an earlier case as a `ROW_NUMBER()` filter.
