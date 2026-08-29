# Pandas: exploring data

## The one-sentence version

Before you compute anything, five commands tell you the shape, the types, the ranges, the missing values, and the distinct categories, and skipping them is how wrong analyses start.

## What it is

Exploration is the first pass over a fresh DataFrame: how big, what columns, what types, what values, where the gaps are. It is not analysis; it is the reconnaissance that tells you what cleaning the analysis needs.

## Why it exists

Every wrong number an analyst has ever shipped came partly from computing on data they had not looked at. A column that is 40% null. A "revenue" column that is actually text. Three spellings of one region. A date range that runs into next year. These are all visible in ten seconds of exploration and invisible in a `.sum()`.

## How it works

**Shape and structure:**

```python
df.shape            # (4612, 7)
df.info()           # every column: name, non-null count, dtype
df.dtypes           # just the types
df.columns.tolist() # the column names as a list
```

`df.info()` is the most useful single command. The "non-null count" per column is your missing-data map: if a column shows fewer non-nulls than `df.shape[0]`, it has gaps.

**Numeric summary:**

```python
df.describe()       # count, mean, std, min, 25%, 50%, 75%, max per numeric column
```

Read the `min` and `max` rows first. A negative `min` on a quantity column, a `max` that is 100x the `75%`, a `max` date in the future, all jump out here.

**Category summary:**

```python
df["region"].value_counts()          # how many of each value
df["region"].value_counts(dropna=False)  # include NaN in the count
df["region"].nunique()               # number of distinct values
df["region"].unique()                # the distinct values themselves
```

`value_counts()` on a category column is your standardisation check: `West`, `west`, `W`, `Westt` all show as separate rows with their counts.

**Missing values:**

```python
df.isna().sum()                      # nulls per column
df.isna().mean().round(2)             # fraction null per column
df[df["price"].isna()]               # the actual rows with a null price
```

**A first look at rows:**

```python
df.head(10)
df.tail(10)          # check the end for a stray "Total" row
df.sample(5)         # random rows, better than head for spotting variety
```

**Cross-checks:**

```python
df["date"].min(), df["date"].max()   # the date range
df.duplicated().sum()                # exact duplicate rows
df["id"].duplicated().sum()          # duplicate keys
```

## When you use it

Immediately after every load, before any transformation, every time. Build the habit: `df.info()`, `df.describe()`, `value_counts()` on each category column, `isna().sum()`. Two minutes that save two hours.

## A worked example

```python
df = pd.read_csv("transactions.csv", parse_dates=["date"])
df.info()
# -> 4612 rows; unit_price has 4571 non-null (41 missing); store is object

df.describe()
# -> units min = -3 (returns?); unit_price max = 45000 (10x the 75%?)

df["store"].value_counts()
# -> Ikeja 812, Lekki 790, ... , ikeja 4, IKEJA  1   (needs standardising)

df["date"].min(), df["date"].max()
# -> 2024-01-02 to 2024-12-30  (good, no future dates)
```

Four commands and you know the cleaning list: 41 missing prices to handle, negative units to investigate, a price outlier to check, a store column to normalise.

> **Try This**
> On any case dataset, run the full exploration pass and write down every issue you find before touching the data. Then compare your list to what the case brief hints at and what the PM asks about.
