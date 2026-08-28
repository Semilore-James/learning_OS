# SELECT and FROM

## The one-sentence version

`SELECT` names the columns you want, `FROM` names the table they live in, and together they are the smallest complete question you can ask a database.

## What it is

Every query answers the same underlying question: "show me some columns, from some rows, in some table." `SELECT` and `FROM` handle the columns and the table. Filtering the rows comes later, with `WHERE`.

```sql
SELECT first_name, last_name, city   -- the columns you want back
FROM customers;                      -- the table to read them from
```

The database reads the `customers` table and returns a result with three columns and one row per customer.

`SELECT *` means "every column". It is fine for a quick look, but in real work you name the columns you actually need. Naming them makes the query readable, keeps the result small, and means the query still works if someone adds a column to the table later.

## Why it exists

A table can have fifty columns and a million rows. You almost never want all of it. `SELECT` lets you take just the four columns your analysis needs, so the result is something you can actually read and work with.

`FROM` exists because a database holds many tables. The database has no idea which one you mean until you say so.

## How it works

The database evaluates the two clauses in this order: `FROM` first (find the table), then `SELECT` (pick the columns). That order matters more once queries get complex, but even here it explains the error messages: if you misspell the table name, the database fails at `FROM` before it ever looks at your column list.

You can rename a column in the output with `AS`. This is called an "alias", and it is useful when a column name is cryptic or when you build a new value:

```sql
SELECT
  first_name AS "First name",
  last_name  AS "Last name",
  loyalty_points * 0.01 AS dollars_earned   -- a calculated column
FROM customers;
```

## When you use it

Every single query. `SELECT ... FROM ...` is the frame; everything else you learn (`WHERE`, `GROUP BY`, `JOIN`, window functions) slots into that frame. Get comfortable typing it without thinking.

## A worked example

You have been asked: "give me a list of every product and its price, so marketing can check them." The data is in a `products` table with columns `id`, `name`, `category`, `price`, `cost`, `supplier_id`, `created_at`.

Marketing wants the name and the price. Nothing else.

```sql
SELECT
  name,
  price
FROM products
ORDER BY name;   -- sorted alphabetically so it is easy to scan
```

That is the whole job. You resisted `SELECT *`, so the result is two tidy columns instead of seven, and marketing gets exactly what they asked for.

> **Try This**
> SQL Dojo, level 1: you are given a `staff` table and asked for two specific columns. Write the SELECT.
