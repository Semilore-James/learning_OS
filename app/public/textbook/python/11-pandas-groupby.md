# Pandas: groupby and aggregation

## The one-sentence version

`df.groupby("col")["value"].agg(...)` is the pandas version of SQL's GROUP BY: split the rows by a category, compute a number per group, and hand back a summary.

## What it is

`groupby` is split-apply-combine. Split the DataFrame into groups by the values of one or more columns, apply an aggregate (sum, mean, count) to each group, combine the results into a new table with one row per group.

## Why it exists

"Total revenue per store", "average ticket per channel", "orders per customer per month", these are the bread and butter of analysis, and they are all group-by. Writing them as a loop that builds a dictionary is slow and error-prone; `groupby` does it in one readable line.

## How it works

**One group, one aggregate:**

```python
df.groupby("store")["revenue"].sum()
df.groupby("store")["revenue"].mean()
df.groupby("store").size()          # rows per group (like COUNT(*))
df.groupby("store")["order_id"].nunique()   # distinct count per group
```

The result is a Series indexed by store. `.reset_index()` turns it back into a normal two-column DataFrame; `.sort_values(ascending=False)` orders it.

**Several aggregates at once:**

```python
df.groupby("store").agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "count"),
    avg_ticket=("revenue", "mean"),
)
```

The `name=(column, function)` form (named aggregation) gives you clean output column names. This is the one to learn as your default.

**Group by more than one column:**

```python
df.groupby(["region", "quarter"])["revenue"].sum()
```

Gives a result with a two-level index. `.unstack()` pivots the last level out to columns, turning it into a region-by-quarter grid.

**Group by a date part:**

```python
df.groupby(df["date"].dt.to_period("M"))["revenue"].sum()   # monthly totals
df.groupby(df["date"].dt.dayofweek)["revenue"].mean()       # by day of week
```

**Filter groups (HAVING):**

```python
g = df.groupby("customer_id")["revenue"].sum()
g[g > 1000]                          # customers with over 1k lifetime
```

Or in one step: `df.groupby("customer_id").filter(lambda x: x["revenue"].sum() > 1000)` keeps the *rows* of qualifying groups.

**transform: a group value on every row** (for share-of-total, or comparing a row to its group):

```python
df["store_total"] = df.groupby("store")["revenue"].transform("sum")
df["share_of_store"] = df["revenue"] / df["store_total"]
```

`transform` returns a Series the same length as `df`, so it aligns back to the original rows. This is how you get a "percent of group" column without a merge.

## When you use it

Any "X per Y" question. Any summary table. Any time you would build a pivot in Excel. If the answer is a table of totals grouped by something, `groupby` gets you there.

## A worked example

```python
summary = (df.groupby("store")
             .agg(revenue=("revenue", "sum"),
                  orders=("order_id", "count"),
                  avg_ticket=("revenue", "mean"))
             .sort_values("revenue", ascending=False)
             .round(0))
print(summary)

# add each store's share of company revenue
summary["share"] = (summary["revenue"] / summary["revenue"].sum()).round(3)
```

Six lines from raw transactions to a ranked store summary with shares.

> **Try This**
> Case 04 (Customer Order Analysis) is group-by end to end. Build revenue and order count per customer, then per customer per month, then filter to your best customers. Run the same logic in SQL Dojo and compare the two.
