# Outlier detection

## The one-sentence version

An outlier is a value far from the rest, and the job is not to delete it, it is to decide whether it is an error, a rare real event, or the whole point of the analysis.

## What it is

A value that sits well outside the typical range of its column. Three sources, and they need different handling:

- **Data error** — a typo, a unit mix-up, a sensor glitch. Age `220`, price `$1,999,900` where it should be `$1,999.00`, a duplicate zero. Fix or remove.
- **Rare but real** — one enterprise order 100x the median, a viral post, a genuine 2-metre-tall person. Keep it, and consider reporting the median alongside the mean so it does not distort the summary.
- **The finding** — the fraud, the broken store, the outage. In these cases the outlier is what you were hired to find, and removing it would delete the answer.

## Why it exists

Real distributions have tails, and business data has heavy tails (a few huge customers, a few enormous orders). On top of that, every data pipeline occasionally produces garbage. So any numeric column will contain a mix of legitimate extremes and actual errors, and telling them apart requires knowing what the column measures.

## How it works

**Spot them:**

```python
df["amount"].describe()                       # min, max, and the quartiles
df["amount"].quantile([0.01, 0.05, 0.95, 0.99, 1.0])
df.nlargest(10, "amount")[["order_id", "amount", "customer"]]
df.nsmallest(10, "amount")[["order_id", "amount", "customer"]]
df["amount"].plot.box()                        # or a histogram
```

Looking at the actual top and bottom rows, with context columns, is worth more than any rule. You can usually tell at a glance whether the top order belongs to a real enterprise account or is a data-entry disaster.

**Rules of thumb for flagging (not deleting):**

- **IQR rule.** Values below `Q1 - 1.5 x IQR` or above `Q3 + 1.5 x IQR`. Robust, works on skewed data, this is what a boxplot draws.
- **Z-score rule.** Values more than 3 standard deviations from the mean. Only sensible for roughly normal data; on skewed data it flags too much on the long side and nothing on the short side.
- **Domain limits.** The most reliable. `age` must be 0 to 120. `discount_pct` must be 0 to 1. `order_date` must be between the company's founding and today. Percentages, ratios, and physical quantities all have hard bounds you can just assert.

```python
q1, q3 = df["amount"].quantile([0.25, 0.75])
iqr = q3 - q1
mask = (df["amount"] < q1 - 1.5 * iqr) | (df["amount"] > q3 + 1.5 * iqr)
df.loc[mask, "flag"] = "amount_outlier"
```

**Then investigate each flagged group, do not batch-delete.** For each cluster of outliers ask: is there a pattern (all from one store, one date, one import batch)? Is the magnitude plausible (10x median is believable, 10,000x is a typo)? Does a context column explain it (the huge order is a known enterprise customer)?

**Handling options, once you have decided:**

- **Error, recoverable:** fix it (`1999900 / 1000` if it is clearly cents-as-dollars-times-1000).
- **Error, not recoverable:** set to null and treat as missing.
- **Real but distorting a summary:** keep the row, report the median, or winsorize (cap at the 99th percentile) *only* for the specific chart where the tail hurts, and say you did.
- **The finding:** keep it, and it is now the headline.

## When you use it

After types are fixed (so the numbers are comparable) and before computing any mean, standard deviation, or trend. Also any time a chart has one bar or point that dwarfs the rest, forcing everything else to a flat line.

## A worked example

Delivery times for 60,000 orders, in hours. `describe()` shows median 26, mean 41, max 8,400.

`df.nlargest(20, "delivery_hours")`: all 20 are between 6,000 and 8,400 hours (8 to 12 months). Every one has `status = "cancelled"` and a `delivered_at` that equals the cancellation date. The pipeline computed "delivery time" as `cancelled_at - ordered_at` for cancelled orders.

This is a data error with a clear rule. The fix: `delivery_hours` should be null for cancelled orders.

```python
df.loc[df["status"] == "cancelled", "delivery_hours"] = pd.NA
```

Now median 25, mean 28, max 190 (a real problem shipment). The "average delivery time" the team was about to report drops from 41 hours to 28, because the cancelled orders were dragging it up by half.

> **Try This**
> Pick a numeric column in a case dataset. List the top 10 and bottom 10 rows with context. Classify each extreme: error, rare-but-real, or the-finding. Then run Data Detective, where the impossible-value rounds are exactly this: is that number a typo or a clue?
