# Window functions: LAG, LEAD, FIRST_VALUE

## The one-sentence version

`LAG` and `LEAD` reach into the previous or next row of the window, and `FIRST_VALUE` / `LAST_VALUE` reach to the ends, so you can compare a row to its neighbours without joining the table to itself.

## What it is

These are window functions like the ranking ones, but instead of numbering rows they **pull a value from another row** in the same window.

```sql
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month)  AS prev_month_revenue,
  LEAD(revenue) OVER (ORDER BY month) AS next_month_revenue
FROM monthly_revenue;
```

For March, `LAG(revenue)` is February's number and `LEAD(revenue)` is April's, sitting right there on the March row.

## Why it exists

Month-over-month change. Days since a customer's last order. The gap between one event and the next in a user's session. All of these are "this row versus the row before it in time". Without `LAG` you join the table to itself on `month = month - 1`, which is fragile the moment a month is missing. `LAG` just walks the ordered window.

## How it works

`LAG(column, offset, default)`:

- `column` is what to fetch.
- `offset` is how many rows back (default 1).
- `default` is what to return when there is no such row (default `NULL`, e.g. the first row has no previous).

```sql
SELECT
  order_date,
  total,
  total - LAG(total, 1, 0) OVER (PARTITION BY customer_id ORDER BY order_date) AS change_vs_prev
FROM orders;
```

`LEAD` is the same thing forward.

`FIRST_VALUE(column)` and `LAST_VALUE(column)` return the value from the first or last row of the window. `FIRST_VALUE` is straightforward. `LAST_VALUE` has a trap: by default the window "frame" only extends to the current row, so `LAST_VALUE` returns the current row's value, not the true last. To get the real last value you need an explicit frame:

```sql
LAST_VALUE(status) OVER (
  PARTITION BY ticket_id ORDER BY updated_at
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
)
```

Most of the time people reach for `FIRST_VALUE` with an ascending sort, or `FIRST_VALUE` with a descending sort instead of fighting `LAST_VALUE`.

## When you use it

Time series deltas (revenue, active users, price). "Days between events" calculations. Filling a value forward from the start of a group. Detecting when a value changed from one row to the next.

## A worked example

"Flag every order where the customer spent at least double what they spent on their previous order." Table: `orders` (`customer_id`, `order_date`, `total`).

```sql
WITH with_prev AS (
  SELECT
    customer_id,
    order_date,
    total,
    LAG(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_total
  FROM orders
)
SELECT customer_id, order_date, total, prev_total
FROM with_prev
WHERE prev_total IS NOT NULL
  AND total >= 2 * prev_total
ORDER BY customer_id, order_date;
```

`prev_total IS NOT NULL` drops each customer's first order, which has nothing to compare against.

> **Try This**
> Open Case 05 (Fintech Churn) and compute each user's gap in days between consecutive transactions using `LAG(transaction_date)`. A widening gap is an early churn signal.
