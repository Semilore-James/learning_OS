# Duplicate detection and removal

## The one-sentence version

A duplicate is the same real-world thing recorded more than once, and finding them means deciding what "the same thing" means before you delete anything.

## What it is

Two kinds:

- **Exact duplicates** — every column identical. Usually a technical accident: a form double-submitted, an ETL job that ran twice, a join that fanned out.
- **Key duplicates** — the same entity by some identifying set of columns, but other columns differ. Two rows with the same `order_id` where one has status `pending` and the other `shipped`. The same customer entered twice with slightly different names.

The second kind is where the judgment is. You have to define the **key**: the column or columns that should uniquely identify a row.

## Why it exists

Systems retry. Users click twice. Data gets loaded from two overlapping exports. A `JOIN` on a non-unique column multiplies rows. A person is added to the CRM by two reps who did not check first. Every one of these inflates counts and sums: if 3% of your orders are duplicated, your revenue total is 3% too high and nobody will notice until it does not reconcile.

## How it works

**Find exact duplicates:**

```python
df.duplicated().sum()                    # how many exact dupe rows
df[df.duplicated(keep=False)]            # show all of them, including the first
df = df.drop_duplicates()               # drop, keeping the first occurrence
```

```sql
select *, count(*) as n
from orders
group by order_id, customer_id, order_date, total   -- all columns
having count(*) > 1;
```

**Find key duplicates:** decide the key, then check.

```python
df.duplicated(subset=["order_id"]).sum()
df[df.duplicated(subset=["order_id"], keep=False)].sort_values("order_id")
```

```sql
select order_id, count(*)
from orders
group by order_id
having count(*) > 1;
```

**Then decide which row to keep.** Common rules:

- **Most recent.** Sort by an updated timestamp, keep the last. `df.sort_values("updated_at").drop_duplicates("order_id", keep="last")`.
- **Most complete.** Keep the row with the fewest nulls.
- **A specific status.** For orders, keep the row whose status is furthest along the lifecycle.
- **Aggregate them.** If the duplicates are legitimate line items that got flattened, do not drop, `group by` and sum.

**Near-duplicates (fuzzy):** `"Jon Smith"` and `"John Smith"`, `"Acme Inc"` and `"Acme, Inc."`. Standardise first (trim, lowercase, strip punctuation, see the next chapter), then re-check for key duplicates. For names and companies, a fuzzy match library or a blocking-plus-similarity approach is a whole project; flag them for review rather than auto-merging, because a wrong merge is worse than a duplicate.

**The critical check: did a JOIN create them?** If your row count jumped after a join, the duplicates are not in the source; the join key was not unique on one side. Fix the join (aggregate the many-side first, or add columns to the key), do not drop rows afterward.

## When you use it

After standardising formats, before any `count`, `sum`, or `group by` that feeds a headline number. And immediately after every join, as a reflex: check the row count did not change unexpectedly.

## A worked example

An orders table, 48,000 rows. `df.duplicated().sum()` is `0`, so no exact dupes. But `df.duplicated(subset=["order_id"]).sum()` is `1,900`.

Looking at the duplicated ids: each has 2 or 3 rows, identical except for `status` and `last_updated`. This is an event log flattened into a table: one row per status change. The "duplicates" are real history.

Wrong fix: `drop_duplicates("order_id")` keeps a random one, and your revenue total is now based on whichever status happened to be first.

Right fix: keep the latest status per order.

```python
orders = (df.sort_values("last_updated")
            .drop_duplicates("order_id", keep="last"))
```

Now 46,100 rows, one per order, each at its current status. Revenue reconciles.

> **Try This**
> In a case dataset, pick the column that should be a unique id and check `duplicated(subset=[id])`. If there are duplicates, work out why they exist before deleting anything, then choose a keep-rule and justify it in one sentence.
