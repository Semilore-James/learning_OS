# Stored procedures (awareness)

## The one-sentence version

A stored procedure is a named block of SQL-plus-logic that lives in the database and runs when called, and as an analyst you mostly need to recognise one, read it, and know when to ask an engineer rather than write it yourself.

## What it is

```sql
CREATE PROCEDURE refresh_daily_report()
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM daily_report WHERE report_date = current_date;
  INSERT INTO daily_report
  SELECT current_date, region, SUM(total)
  FROM orders
  WHERE created_at::date = current_date
  GROUP BY region;
END;
$$;

CALL refresh_daily_report();
```

It bundles several statements, can take parameters, can contain loops and `IF` branches, and is stored under a name. A **function** is the close cousin that returns a value and can be used inside a query.

## Why it exists

Some work is procedural, not a single query: "for each region, do X, then if Y update Z". Some work needs to run on a schedule or be triggered by an application with one call. Putting it in the database keeps the logic next to the data, runs it without round-trips, and lets the database enforce that it always happens the same way.

## How it works (the parts that matter to you)

- **Called, not selected.** `CALL proc_name(args)` for a procedure; functions are used in `SELECT`.
- **They can have side effects.** A procedure often writes, deletes, or rebuilds tables. Running one is not a read-only act. Know what it touches before you call it.
- **They are written in a procedural dialect** (`PL/pgSQL` in Postgres, `T-SQL` in SQL Server, `PL/SQL` in Oracle) that adds variables, `IF`, `LOOP`, exception handling on top of SQL. The dialects do not transfer between engines.
- **Reading one is a real skill.** When a report is wrong and the numbers come from a table that a procedure populates, you need to open the procedure and trace its logic to find where the number is formed.
- **Version control and testing are weaker** than for application code in most shops, which is part of why analysts are often told to keep transformation logic in dbt models or plain SQL files instead.

## When you use it

As an analyst: rarely to write, often to read. You call a provided procedure to refresh a dataset you depend on. You read one to understand how a warehouse table is built. You flag to an engineer when a procedure's logic looks wrong or out of date. If you find yourself wanting to write one for analytical transformation, that is usually a sign the work belongs in a scheduled SQL model (dbt, Airflow, a warehouse scheduled query) where it can be reviewed and tested.

## A worked example

You are handed a `customer_health` table and told "it updates nightly". A churn number from it looks off. You find the procedure:

```sql
CREATE PROCEDURE rebuild_customer_health() ...
BEGIN
  TRUNCATE customer_health;
  INSERT INTO customer_health
  SELECT
    customer_id,
    CASE WHEN last_order_at < now() - interval '60 days' THEN 'at_risk' ELSE 'ok' END
  FROM customers;
END;
```

Reading it, you see the churn threshold is hardcoded at 60 days. The finance team has been using 90. The bug is not in your query; it is a stale constant in a procedure, and now you know exactly what to put in the ticket.

> **Try This**
> No game or case requires writing a procedure. Instead, next time you read someone else's SQL file, look for `CREATE FUNCTION` or `CREATE PROCEDURE` and practise tracing what it does line by line, the same way you would read a short program.
