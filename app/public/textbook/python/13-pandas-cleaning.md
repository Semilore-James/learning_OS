# Pandas: cleaning data

## The one-sentence version

Cleaning in pandas is a short sequence of column operations, trim, standardise, retype, handle nulls, drop duplicates, catch impossible values, and writing it as code makes it repeatable and auditable.

## What it is

The pass between "loaded" and "trustworthy". Same checklist as cleaning in Excel, but each step is a line of pandas that runs the same way every time and can be read by whoever reviews your work.

## Why it exists

A `.sum()` does not know `"West "` and `"West"` are the same. `.mean()` silently skips nulls. A numeric column with one `"n/a"` loads as text and will not compute. Cleaning fixes these before they make the answer wrong, and doing it in code means next month's file gets the same treatment automatically.

## How it works

**Work on a copy** so you can rerun cells: `df = df_raw.copy()`.

**Column names:**

```python
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
```

**Trim and standardise text:**

```python
df["store"] = df["store"].str.strip().str.title()      # "  ikeja " -> "Ikeja"
df["region"] = df["region"].replace({"w": "West", "West ": "West", "WEST": "West"})
```

For a big mess, a mapping dict plus `.map()` with a fallback:

```python
mapping = {"w": "West", "west": "West"}
df["region"] = df["region"].map(mapping).fillna(df["region"])
```

**Fix types:**

```python
df["price"] = pd.to_numeric(df["price"], errors="coerce")   # bad values -> NaN
df["date"] = pd.to_datetime(df["date"], errors="coerce")
df["is_member"] = df["is_member"].map({"Y": True, "N": False})
```

`errors="coerce"` turns unparseable values into `NaN`/`NaT` instead of raising, so one bad row does not stop the load. Then you decide what to do with those NaNs.

**Handle missing values, deliberately per column:**

```python
df["discount"] = df["discount"].fillna(0)          # missing discount = no discount
df = df.dropna(subset=["order_id"])                # a row with no id is unusable
df["region"] = df["region"].fillna("Unknown")      # flag, do not guess
```

Never blanket-`fillna(0)` a whole DataFrame. A missing rating is not a zero rating; filling it biases every average.

**Duplicates:**

```python
df.duplicated().sum()                              # how many exact dupes
df = df.drop_duplicates()                          # drop exact
df = df.drop_duplicates(subset=["order_id"], keep="last")   # dupe defined by key
```

**Catch impossible values:**

```python
df.loc[df["units"] < 0, "flag"] = "negative units"
df.loc[df["discount_pct"] > 1, "flag"] = "discount over 100%"
df.loc[df["date"] > pd.Timestamp.today(), "flag"] = "future date"
bad = df[df["flag"].notna()]
```

Flag rather than silently delete, then decide with the finding in mind.

**Deriving cleaned columns:**

```python
df["revenue"] = (df["units"] * df["unit_price"]).round(2)
df["month"] = df["date"].dt.to_period("M")
```

## When you use it

Every dataset, right after exploration, before analysis. Write it as a `clean(df)` function so the pipeline is one call and the reviewer can read exactly what you did.

## A worked example

```python
def clean(df):
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    df["store"] = df["store"].str.strip().str.title()
    df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce")
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.drop_duplicates("transaction_id")
    df["flag"] = pd.NA
    df.loc[df["units"] < 0, "flag"] = "negative units"
    df.loc[df["unit_price"].isna(), "flag"] = "missing price"
    df["revenue"] = (df["units"] * df["unit_price"]).round(2)
    return df

df = clean(pd.read_csv("transactions.csv"))
print(df["flag"].value_counts(dropna=False))
```

One function, and the cleaning is now a documented, repeatable step.

> **Try This**
> Write a `clean()` function for a case dataset. Run `df["flag"].value_counts()` to see what it caught. Then, when the case asks you to explain your cleaning, your function *is* the explanation.
