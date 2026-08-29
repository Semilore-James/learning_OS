# DISTINCT and aliases

## The one-sentence version

`DISTINCT` removes duplicate rows from a result, and an alias renames a column or table so the query reads cleanly.

## What it is

`DISTINCT` goes right after `SELECT` and applies to the whole row you selected:

```sql
SELECT DISTINCT city
FROM customers;
```

Every city that appears at least once, listed once. Without `DISTINCT` you would get one row per customer, with the same city repeated hundreds of times.

An alias uses `AS` to give something a new name in the query:

```sql
SELECT c.name AS customer_name,
       o.total AS order_total
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id;
```

`AS` is optional in most databases (`customers c` works), but writing it out is clearer.

## Why it exists

**DISTINCT** answers "what are the possible values" questions: which regions do we operate in, which statuses does an order go through, which error codes have we seen. The raw column has repeats; you want the set.

**Aliases** exist because real column names are often ugly (`cust_acct_id_v2`), and computed columns have no name at all until you give them one. A query full of `t1.col_a` is unreadable; a query with `revenue` and `signup_month` explains itself.

## How it works

`DISTINCT` looks at every column in your `SELECT` list together. These two are different:

```sql
SELECT DISTINCT city FROM customers;          -- unique cities
SELECT DISTINCT city, country FROM customers; -- unique city+country pairs
```

The second keeps "Springfield, US" and "Springfield, UK" as separate rows.

`DISTINCT` is not free. The database has to compare rows to find duplicates, which costs time on a big table. If you find yourself reaching for `DISTINCT` to fix a result that has unexpected duplicates, stop and check your joins first. A `DISTINCT` papering over a bad join is a bug waiting to happen.

Aliases have one rule worth knowing: you can use a column alias in `ORDER BY` but not in `WHERE`, because `WHERE` runs before `SELECT` assigns the alias.

```sql
SELECT price * quantity AS line_total
FROM order_items
WHERE price * quantity > 100   -- must repeat the expression here
ORDER BY line_total DESC;       -- but the alias is fine here
```

## When you use it

`DISTINCT` when you want the *set* of values in a column, or to sanity-check that a column has the values you expect. Aliases in every query with a join or a computed column, which is most of them.

## A worked example

"How many different products has each customer ever bought?" You have `order_items` with `customer_id` and `product_id`.

```sql
SELECT customer_id,
       COUNT(DISTINCT product_id) AS distinct_products
FROM order_items
GROUP BY customer_id
ORDER BY distinct_products DESC;
```

`COUNT(DISTINCT product_id)` is the key: a customer who bought the same product ten times still counts as one distinct product. The alias `distinct_products` makes the `ORDER BY` readable.

> **Try This**
> SQL Dojo has a DISTINCT step early on. Also open Case 04 and answer "how many regions do we actually sell into" with a single `SELECT DISTINCT`.
