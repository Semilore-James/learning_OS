# Subqueries

## The one-sentence version

A subquery is a query inside another query, used to compute a value or a list that the outer query needs.

## What it is

Sometimes the thing you want to filter or compare against is itself the result of a query. A subquery lets you write that inner query in brackets, right where the value is needed.

```sql
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

The inner query `(SELECT AVG(price) FROM products)` returns one number, the average price. The outer query uses it as the comparison value. Products priced above average come back.

## Why it exists

"Above average", "more than the median customer", "products that have never been ordered", "the customer's most recent order" — all of these need a value or a set that you cannot type as a literal, because it depends on the data. A subquery computes it inline.

## How it works

Subqueries show up in three places, and the shape of the result differs:

**In WHERE, returning one value** (a scalar subquery):

```sql
WHERE signup_date > (SELECT MAX(signup_date) FROM customers WHERE country = 'NG') - INTERVAL '30 days'
```

**In WHERE with IN, returning a list**:

```sql
SELECT name FROM products
WHERE id IN (SELECT product_id FROM order_items);   -- products that have been ordered
```

Swap `IN` for `NOT IN` to get products that have *never* been ordered — a classic. Be careful: `NOT IN` behaves strangely if the subquery can return NULL, so filter NULLs out of it or use `NOT EXISTS` instead.

**In FROM, returning a table** (a derived table), which must have an alias:

```sql
SELECT country, AVG(order_count) AS avg_orders_per_customer
FROM (
  SELECT c.country, c.id, COUNT(o.id) AS order_count
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.country, c.id
) AS per_customer
GROUP BY country;
```

Here you aggregate twice: once per customer inside the subquery, then again per country outside it.

A **correlated** subquery refers to the outer query's row, so it runs once per outer row:

```sql
SELECT o.id, o.total
FROM orders o
WHERE o.total > (
  SELECT AVG(total) FROM orders WHERE customer_id = o.customer_id
);
```

Each order compared to that customer's own average. Powerful, but slower, and often clearer as a window function or a CTE, which are the next two topics.

## When you use it

When a filter or a computed column depends on an aggregate or a list drawn from the data. When you need to aggregate the result of an aggregate. When the alternative is running one query, copying a number, and pasting it into a second query.

## A worked example

"Which customers have spent more than double the average customer's lifetime spend?" Tables: `orders` with `customer_id` and `total`.

```sql
SELECT customer_id, SUM(total) AS lifetime_spend
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 2 * (
  SELECT AVG(customer_total) FROM (
    SELECT SUM(total) AS customer_total FROM orders GROUP BY customer_id
  ) AS per_customer
);
```

The inner-inner query gives each customer's total; the middle query averages those totals; the outer query keeps customers above double that average. Read it from the inside out.

> **Try This**
> SQL Dojo level 13 is a scalar subquery. Then Case 05 (Fintech Churn) uses `NOT IN` / `NOT EXISTS` to find users who stopped transacting.
