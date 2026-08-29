# Pandas: merging and joining

## The one-sentence version

`pd.merge(left, right, on="key", how="left")` is the pandas JOIN: attach columns from one table to another by matching a key, and the `how` decides what happens to rows that do not match.

## What it is

Merging combines two DataFrames side by side on a shared key column. `concat` stacks tables on top of each other (same columns, more rows); `merge` widens a table (same rows, more columns from a lookup).

## Why it exists

Data comes in pieces. Transactions in one file, the product catalogue in another, customer details in a third. To compute revenue you need the price from the catalogue attached to each transaction. That is a merge. It is the single most common way real data gets assembled, and the place bugs hide (a bad key, a many-to-many blow-up, silently dropped rows).

## How it works

**The basic merge:**

```python
df = pd.merge(sales, products, on="product_code", how="left")
```

- `on="product_code"`: the key column, present in both. If the columns have different names: `left_on="code", right_on="product_code"`.
- `how`: the join type.

| `how` | Keeps |
|---|---|
| `"left"` | every row of `left`; `right` columns are `NaN` where no match. The safe default for a lookup. |
| `"inner"` | only rows that match in both |
| `"right"` | every row of `right` |
| `"outer"` | every row of both, `NaN` where either side is missing |

**Always check the row count.** A left merge should not change the number of rows:

```python
before = len(sales)
df = pd.merge(sales, products, on="product_code", how="left")
assert len(df) == before, "merge changed the row count"
```

If it grew, the right table has duplicate keys and every match multiplied. Deduplicate the lookup first: `products = products.drop_duplicates("product_code")`.

**Check what did not match:**

```python
df = pd.merge(sales, products, on="product_code", how="left", indicator=True)
df["_merge"].value_counts()
# both        4500
# left_only    112   <- 112 sales with a product_code not in the catalogue
```

`indicator=True` adds a `_merge` column telling you the source of each row. `left_only` rows are the ones you need to explain, a bad code, a discontinued product, a typo.

**Merge on the index:** `left.join(right)` joins on the index by default, shorthand when both are indexed by the key.

**Concatenate (stack):**

```python
all_months = pd.concat([jan, feb, mar], ignore_index=True)
```

`ignore_index=True` renumbers the rows. Use `keys=["Jan","Feb","Mar"]` to add a level marking which source each row came from.

## When you use it

Any time the number you need requires data from more than one table. Attaching prices, categories, customer segments, region names, targets. If you are typing values from one sheet into another by hand, that is a merge you should be doing in code.

## A worked example

```python
sales = pd.read_csv("sales.csv", dtype={"product_code": str})
products = pd.read_csv("products.csv", dtype={"product_code": str}).drop_duplicates("product_code")

before = len(sales)
df = pd.merge(sales, products[["product_code", "unit_price", "category"]],
              on="product_code", how="left", indicator=True)

assert len(df) == before
unmatched = df[df["_merge"] == "left_only"]["product_code"].unique()
print(f"{len(unmatched)} product codes not in the catalogue: {unmatched[:5]}")

df["revenue"] = df["units"] * df["unit_price"]
```

Dedupe the lookup, merge left, assert the count, list the unmatched, then compute. That order is the discipline that keeps merges honest.

> **Try This**
> Case 04 and Case 19 both need a join across tables. Do the join in pandas with `how="left"` and `indicator=True`, check the row count did not change, and report which keys did not match. Then do the same join in SQL Dojo.
