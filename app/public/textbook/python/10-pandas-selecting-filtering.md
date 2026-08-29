# Pandas: selecting and filtering

## The one-sentence version

Selecting picks the columns and rows you want, filtering keeps the rows that match a condition, and `.loc` is the one tool that does both without the traps.

## What it is

- **Select a column:** `df["revenue"]` (a Series) or `df[["store", "revenue"]]` (a DataFrame).
- **Filter rows:** `df[df["revenue"] > 1000]` keeps rows where the condition is true.
- **Both at once:** `df.loc[df["revenue"] > 1000, ["store", "revenue"]]`.

## Why it exists

Analysis is mostly "look at this subset". Revenue for the West region. Deals from last quarter. Rows where the total does not add up. Every one of these is a filter, and doing it in one clear expression, rather than looping, is what makes pandas fast and readable.

## How it works

**Boolean filtering.** A comparison on a column gives a Series of True/False, and `df[...]` keeps the True rows:

```python
df[df["units"] > 0]
df[df["store"] == "Ikeja"]
df[df["date"] >= "2024-07-01"]
```

**Combine conditions** with `&` (and), `|` (or), `~` (not), and wrap each in parentheses:

```python
df[(df["store"] == "Ikeja") & (df["units"] > 0)]
df[(df["region"] == "West") | (df["region"] == "East")]
df[~df["status"].isin(["Lost", "Cancelled"])]
```

`and`/`or` (the words) do not work on Series; you must use `&`/`|`, and the parentheses are required because `&` binds tighter than `==`.

**Useful condition builders:**

```python
df[df["region"].isin(["West", "East"])]      # value is one of a list
df[df["price"].isna()]                        # value is missing
df[df["price"].notna()]                       # value is present
df[df["email"].str.contains("@", na=False)]   # text contains
df[df["date"].dt.year == 2024]                # date part
df[df["revenue"].between(100, 500)]           # in a range
```

**`.loc` for label-based selection**, rows and columns together:

```python
df.loc[df["units"] > 0, "revenue"]                    # revenue of positive-unit rows
df.loc[df["store"] == "Ikeja", ["date", "units", "price"]]
df.loc[df["price"].isna(), "price"] = 0               # assign into a filtered slice
```

Use `.loc` for anything that both filters and picks columns, and always for assignment. `df[df["price"].isna()]["price"] = 0` is the classic mistake, it assigns into a temporary copy and silently does nothing (pandas warns: "SettingWithCopyWarning"). `df.loc[df["price"].isna(), "price"] = 0` does it correctly.

**`.iloc` for position-based** (rows/columns by number, rare in analysis):

```python
df.iloc[0]         # first row
df.iloc[:5, :3]    # first 5 rows, first 3 columns
```

**`.query()`** is a readable alternative for complex filters:

```python
df.query("units > 0 and store == 'Ikeja' and revenue > 1000")
```

**Sorting:**

```python
df.sort_values("revenue", ascending=False)
df.sort_values(["region", "revenue"], ascending=[True, False])
df.nlargest(10, "revenue")   # top 10 by revenue
```

## When you use it

Constantly. Every "show me just..." is a filter. Every "for the analysis I only care about..." is a select. If you catch yourself writing `for index, row in df.iterrows()` to check a condition, stop, it is a boolean filter.

## A worked example

Find the suspicious rows in a till dataset:

```python
returns   = df[df["units"] < 0]
mismatch  = df[df["total"] != df["units"] * df["unit_price"]]
big_price = df[df["unit_price"] > df["unit_price"].quantile(0.99)]
missing   = df[df["unit_price"].isna()]

print(f"{len(returns)} returns, {len(mismatch)} total mismatches, "
      f"{len(big_price)} price outliers, {len(missing)} missing prices")
```

Four filters, four counts, and you have the QA picture with no loop.

> **Try This**
> Case 05 (Fintech Churn) is a filtering exercise. Slice the transactions to one user, to the last 90 days, to failed payments, and to accounts with no activity. Each is a one-line filter. Compare to the WHERE clauses SQL Dojo drills.
