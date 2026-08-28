# GROUP BY and HAVING

## The one-sentence version

`GROUP BY` collapses many rows into one row per category so you can total or average within each category, and `HAVING` filters those grouped rows.

## What it is

An aggregate function (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) turns a column of many values into a single number. `SUM(amount)` over a whole table gives you one grand total.

Most of the time you do not want one grand total. You want a total per customer, per month, per product category. `GROUP BY` is how you say which column defines the categories.

```sql
SELECT
  category,
  COUNT(*)     AS product_count,
  AVG(price)   AS avg_price
FROM products
GROUP BY category;
```

The database sorts the rows into piles by `category`, then runs `COUNT` and `AVG` inside each pile. You get one row per category.

## Why it exists

Almost every business question is a "per something" question. Revenue per region. Tickets per agent. Sign-ups per week. Without `GROUP BY` you would run a separate query for every category and stitch the answers together by hand. `GROUP BY` does all the piles in one pass.

## How it works, and the rule that trips everyone

Here is the rule: every column in your `SELECT` must be either **in the `GROUP BY`** or **wrapped in an aggregate function**. Nothing else is allowed.

The reason is simple once you see it. If you group by `category`, each result row stands for a whole pile of product rows. Asking for `name` in that row makes no sense, because the pile has many names. The database does not guess; it raises an error. So you either group by `name` too (making smaller piles), or you aggregate it (`MAX(name)`, `STRING_AGG(name, ', ')`), or you leave it out.

## WHERE versus HAVING

Both filter, but at different moments:

- `WHERE` runs **before** grouping. It decides which rows go into the piles.
- `HAVING` runs **after** grouping. It decides which piles survive, and it can test the aggregate.

```sql
-- categories that have more than 10 products, looking only at products
-- created since 2025, and only those over 5 dollars
SELECT
  category,
  COUNT(*) AS product_count
FROM products
WHERE created_at >= '2025-01-01'   -- filter rows first
  AND price > 5
GROUP BY category
HAVING COUNT(*) > 10;              -- then filter the groups
```

A test you cannot write in `WHERE` ("groups with more than 10 rows") is exactly what `HAVING` is for, because the count does not exist until after grouping.

## When to use it, and when to reach for something else

Use `GROUP BY` whenever the question is "for each X, what is the total / average / count of Y".

Reach for a **window function** instead when you want the per-group number **next to the original rows** rather than collapsing them, for example "each order, and the customer's running total to date". Reach for a **subquery** when you need the grouped result as an input to another calculation. Those come later; for now, if the question collapses to one row per category, `GROUP BY` is the tool.

## A worked example

Question: "which three product categories bring in the most revenue, and only count categories doing more than 50,000 in total?"

Revenue per line item is `quantity * unit_price` in the `order_items` table, which has `order_id`, `product_id`, `quantity`, `unit_price`, and a `category` copied in for convenience.

```sql
SELECT
  category,
  SUM(quantity * unit_price) AS revenue
FROM order_items
GROUP BY category
HAVING SUM(quantity * unit_price) > 50000
ORDER BY revenue DESC
LIMIT 3;
```

`GROUP BY` builds the piles, `SUM` totals each, `HAVING` drops the small ones, `ORDER BY` and `LIMIT` take the top three.

> **Try This**
> Case 04 (Customer Order Analysis) asks for revenue per customer with a minimum threshold. Write the `GROUP BY ... HAVING` for that deliverable.
