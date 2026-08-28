# What a database is, and why

## The one-sentence version

A database is a place that stores information in tables, and answers questions about that information quickly and reliably, even when many people ask at once.

## What it is

Think of a spreadsheet you already know. It has rows, columns, and a name at the top of the tab. A database table is the same idea: rows are records (one customer, one order, one sensor reading), columns are fields (the customer's name, the order total, the temperature).

The difference is that a spreadsheet is a single file that one person opens at a time, and a database is a running program (a "database management system", often shortened to DBMS) that holds many tables and lets many people read and write them at the same time without the file getting corrupted.

The tables in a database are usually connected to each other. A `customers` table has one row per customer. An `orders` table has one row per order, and each order row carries the id of the customer who placed it. That shared id is how the database knows which orders belong to which customer. This style of storage, tables linked by shared ids, is called a "relational database", and the language you use to ask it questions is SQL ("Structured Query Language").

## Why it exists

Spreadsheets stop working well at three points, and a database fixes all three.

**Size.** A spreadsheet slows to a crawl somewhere around a few hundred thousand rows. A database handles hundreds of millions of rows and still answers a well-written question in under a second.

**Sharing.** If two people edit the same spreadsheet file, one of them loses their changes. A database is built for concurrency (many users at once). It keeps every change consistent and in order.

**Truth.** In a spreadsheet, the same customer's name might be spelled three different ways in three places, and nothing stops that. A database lets you set rules: this column must be a date, this id must exist in the customers table, this value cannot be empty. The data stays trustworthy because the database refuses to store anything that breaks the rules.

## How it works, briefly

You connect to the database with a client (a program, or a tool like DBeaver or SSMS). You send it a query written in SQL. The database figures out the fastest way to find the answer, reads only the rows it needs, and sends back a result: itself just another table, called a "result set". You never move the whole database to your machine. You ask a question, you get an answer.

## When you reach for it

Any time the data is bigger than a spreadsheet is comfortable with, is shared by more than one person or system, or needs to stay clean over months and years. In practice, that is almost every real analytics job. The company's data lives in a database (or several), and your work starts by writing SQL to pull the slice you care about.

```sql
-- your first query looks at everything in one table
-- (you will learn to be more selective in the next chapter)
SELECT *
FROM customers;
```

> **Try This**
> Open the SQL Dojo game and clear level 1. It gives you a table and a plain-English question, and asks you to write the SELECT that answers it.
