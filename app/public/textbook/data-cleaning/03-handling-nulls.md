# Strategies for handling nulls

## The one-sentence version

There is no default fix for missing data; you pick per column based on why it is missing and what the analysis needs, and you write down the choice.

## What it is

The main options, from least to most invasive:

- **Leave it.** Many tools skip nulls correctly. `AVG` in SQL and `.mean()` in pandas both ignore them. If you are just summarising, often you do nothing.
- **Drop rows.** Remove any row missing a value you need. Safe when few rows are affected and the missingness is random.
- **Drop the column.** If a column is 60%+ missing and not central, cutting it is cleaner than pretending you have it.
- **Fill with a constant.** `discount` blank means `0`. `region` blank means `"Unknown"`. Only when the blank genuinely maps to a known value.
- **Fill with a statistic.** Replace with the column's mean, median, or mode. Quick, but it shrinks variance and can bias results.
- **Fill from a group.** Replace with the median *for that customer's segment* or the last known value for that customer over time. Better than a global statistic.
- **Model it (imputation).** Predict the missing value from the other columns. Most accurate, most effort, and easy to overfit. Rarely needed for analyst work.

## Why it exists

Every choice trades something. Dropping rows loses data and can bias the sample. Filling with the mean makes the column look more certain than it is and drags every group toward the overall average. Filling with a placeholder can silently turn "unknown" into a real category that then shows up in charts. There is no free option, so the choice has to be deliberate.

## How it works

**Decide per column, using these questions:**

1. **Does blank mean something specific?** If yes, fill with that. `late_fee` blank = `0`. `end_date` blank = "still active". `promo_code` blank = "no promo".
2. **How much is missing?** Under ~5% and random: drop the rows or leave them. 5 to 30%: fill thoughtfully or segment. Over ~30%: consider dropping the column or treating "missing" as a category.
3. **Is the missingness random or patterned?** (From the previous chapter.) If income is missing more often for one channel, dropping those rows biases the result. Filling with the overall median also biases it. You may need to fill within channel, or keep "income unknown" as its own bucket.
4. **What does the analysis do with this column?** A column used only for a filter can tolerate a rough fill. A column that is the outcome variable of a model cannot be imputed at all without leaking.

**The mechanics:**

```python
df = df.dropna(subset=["order_id"])                 # a row with no id is unusable
df = df.drop(columns=["middle_name"])               # 95% empty, not needed
df["discount"] = df["discount"].fillna(0)           # blank = no discount
df["region"] = df["region"].fillna("Unknown")       # flag, do not guess
df["price"] = df["price"].fillna(df["price"].median())        # global median
df["price"] = df.groupby("category")["price"].transform(      # per-group median
    lambda s: s.fillna(s.median()))
df["balance"] = df.sort_values("date").groupby("account")["balance"].ffill()  # carry forward
```

```sql
select coalesce(discount, 0) as discount from orders;
delete from staging_orders where order_id is null;
update customers set region = 'Unknown' where region is null;
```

**Never blanket-fill.** `df.fillna(0)` on the whole frame turns every missing rating into a zero rating, every missing date into `1970`, every missing category into the number `0`. It will run without error and quietly corrupt half your columns.

**If you fill, keep a flag.** Add a boolean column `price_was_imputed` before you fill. Later you can check whether your finding holds when you exclude the imputed rows.

## When you use it

After you have counted the missing values and checked their pattern, once per column, as an explicit decision you can defend. This is a step in the cleaning function, not something you improvise in the analysis.

## A worked example

A sales dataset. Three columns have nulls, three different fixes:

- `commission_rate` is null in 8,000 of 50,000 rows. Checking: it is null exactly when `deal_type = 'renewal'`, and renewals pay no commission. This is not missing data. Fill with `0` and move on.
- `deal_size` is null in 300 rows, scattered randomly across reps and quarters. 0.6% and random. Drop those rows, note it.
- `industry` is null in 12,000 rows (24%), concentrated in deals from before the CRM added the field in 2024. Not random, too many to drop, and there is no way to recover it. Keep it as a category: `df["industry"] = df["industry"].fillna("Not recorded")`, and when you break revenue down by industry, show "Not recorded" as its own bar so nobody assumes it is zero.

Three columns, three decisions, all written into the cleaning function and the methods note.

> **Try This**
> For a case dataset, make a table: column, percent missing, whether it is random, your chosen strategy, and one sentence of why. Then write the `clean()` function that applies it. When the case asks you to explain your cleaning, that table is the answer.
