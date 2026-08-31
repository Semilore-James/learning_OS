# What dirty data looks like

## The one-sentence version

Dirty data is any gap between what a column claims to be and what it actually contains, and learning to see those gaps quickly is the difference between a two-hour analysis and a two-day one.

## What it is

Data is "dirty" when it will produce a wrong answer if you analyse it as-is. The categories you meet again and again:

- **Missing values** — blanks, `NULL`, `NaN`, and the disguised ones: `"N/A"`, `"none"`, `-1`, `0`, `9999`, empty string, a single space.
- **Inconsistent categories** — `"NY"`, `"New York"`, `"new york"`, `"N.Y."`, `" NY "` all meaning the same place.
- **Wrong types** — a number stored as text because one row had a comma, a date stored as `"2026-13-01"` or `"01/02/26"` with no way to know the order.
- **Duplicates** — the same real-world thing appearing twice, exactly or with tiny differences.
- **Impossible values** — negative ages, order dates in the future, percentages over 100, a total that does not equal the sum of its parts.
- **Structural problems** — merged header rows, a summary row mixed in with data rows, one column holding two facts (`"Lagos, Nigeria"`), multiple tables stacked in one sheet.
- **Silent encoding issues** — `café` showing as `cafÃ©`, trailing whitespace you cannot see, non-breaking spaces, smart quotes.

## Why it exists

Data is produced by people, forms, sensors, and integrations, none of which agree on conventions. A CRM lets sales reps type the country field freehand. An export tool writes numbers with thousands separators. A merge between two systems keys on email, and one system lowercases it and the other does not. None of this is anyone's fault; it is just what happens when data crosses a boundary. Your job is to expect it.

## How it works

**The five-minute triage, run on every new dataset before any analysis:**

1. **Shape.** How many rows and columns. Does the row count match what you expected? A "full year of orders" with 340 rows is a red flag.
2. **Head and tail.** Look at the first and last 10 rows. The tail often hides a totals row or a note.
3. **Types.** What did the tool infer each column as? A column you know is numeric showing up as text means something in it is not a number.
4. **Nulls per column.** A quick count of missing values in each column. One column that is 90% empty changes your whole plan.
5. **Value counts for categoricals, min/max for numerics.** `value_counts()` on `country` instantly shows `"NY"` and `"New York"` sitting next to each other. `min`/`max` on `age` instantly shows the `-1` and the `999`.

```python
df.shape
df.head(10); df.tail(10)
df.dtypes
df.isna().sum()
df["country"].value_counts(dropna=False)
df[["age", "price", "order_date"]].describe(include="all")
```

```sql
select count(*) from orders;
select column_name, data_type from information_schema.columns where table_name = 'orders';
select count(*) - count(email) as missing_email from orders;
select country, count(*) from orders group by country order by 2 desc;
select min(age), max(age), min(order_date), max(order_date) from orders;
```

**Write down what you find.** Not in your head. A short list: "region has 4 spellings of West; price is text because of the £ sign; 12 rows have order_date after today". That list becomes your cleaning plan and, later, your methods section.

## When you use it

The first thing you do with any file, every time, before you write a single line of real analysis. Skipping it is the single most common reason an analysis has to be redone.

## A worked example

A "clean" export of 5,000 support tickets. Five minutes of triage:

- `df.shape` is `(5001, 8)`. The extra row: the last row is `"Total: 5000 tickets"` in the first column, everything else blank.
- `df.dtypes` shows `resolution_hours` as `object` (text). `value_counts` reveals 30 rows contain `"pending"` instead of a number.
- `df.isna().sum()` shows `assigned_agent` is 40% null (unassigned tickets, which turns out to be meaningful, not missing).
- `df["channel"].value_counts()` shows `email`, `Email`, `EMAIL`, and `e-mail`.
- `df["created_at"].max()` is three months in the future.

None of this was visible from the file name or the first row. Fifteen minutes of triage saved a full redo when someone would have noticed the ticket count was off by one and the "average resolution time" excluded every pending ticket.

> **Try This**
> Run the five-minute triage on a case dataset. Produce the written list of problems before you do anything else. Then play Data Detective, which is this exact skill turned into a game: spot the row that does not belong.
