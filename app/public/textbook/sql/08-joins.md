# JOINs

## The one-sentence version

A join stitches two tables together on a matching column, so you can put the customer's name next to the order they placed.

## What it is

Data is spread across tables on purpose. `orders` stores a `customer_id`, not the customer's whole name and address, because repeating that on every order would be wasteful and error-prone. A join is how you reunite them for a query.

```sql
SELECT o.id AS order_id,
       o.order_date,
       c.name AS customer_name
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id;
```

`ON c.id = o.customer_id` is the join condition: for each order, find the customer whose `id` equals the order's `customer_id`, and glue that customer's columns onto the order's row.

## Why it exists

Almost every real question spans tables. "Revenue by customer country" needs `orders` (for revenue) and `customers` (for country). "Products never ordered" needs `products` and `order_items`. Without joins you would run two queries and merge them by hand, which does not scale past a few rows.

## How it works

There are four kinds, and they differ only in what happens to rows with no match.

- **INNER JOIN** (just `JOIN`): keep only rows that match on both sides. An order with a `customer_id` that does not exist in `customers` is dropped. A customer with no orders is dropped.
- **LEFT JOIN**: keep every row from the left (first) table. Where the right table has no match, its columns come back as NULL. This is how you find "customers with zero orders" — LEFT JOIN orders, then look for the rows where the order columns are NULL.
- **RIGHT JOIN**: the mirror image. Rare, because you can always swap the tables and use LEFT.
- **FULL JOIN**: keep everything from both sides, filling NULLs where there is no match.

```sql
-- every customer, and their order count (0 for customers who never ordered)
SELECT c.name, COUNT(o.id) AS order_count
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

Note `COUNT(o.id)`, not `COUNT(*)`. After a LEFT JOIN, a customer with no orders still produces one row (with NULL order columns), so `COUNT(*)` would say 1. `COUNT(o.id)` counts only the non-NULL order ids, so it correctly says 0.

You can join more than two tables by chaining `JOIN ... ON` clauses. Each one connects the growing result to one more table.

The number one join bug: a join condition that matches too many rows, so every order gets duplicated. If your row count jumps after adding a join, check that the column you joined on is unique on at least one side.

## When you use it

Any question that needs a fact from one table and an attribute from another. Which is most questions. Building the habit: name the tables you need first, then figure out the column that links each pair.

## A worked example

"Total revenue per customer country." Tables: `customers` (`id`, `country`), `orders` (`id`, `customer_id`), `order_items` (`order_id`, `qty`, `unit_price`).

Revenue lives in `order_items` (`qty * unit_price`). Country lives in `customers`. `orders` is the bridge between them.

```sql
SELECT c.country,
       SUM(oi.qty * oi.unit_price) AS revenue
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id
JOIN order_items AS oi ON oi.order_id = o.id
GROUP BY c.country
ORDER BY revenue DESC;
```

Two joins to connect three tables, then aggregate. This shape — customer to order to line item — comes up constantly in e-commerce.

> **Try This**
> SQL Dojo levels 9 through 12 walk through JOIN, LEFT JOIN, and multi-table joins. Then Case 04: the whole case hangs on joining `customers` to `orders` to `order_items`.
