# Standardizing formats: dates, strings, numbers

## The one-sentence version

Standardizing is forcing every value in a column into one consistent form, because a `GROUP BY` treats `"West"` and `"west "` as two different regions and a `SUM` chokes on `"1,200"`.

## What it is

Making a column internally consistent:

- **Strings** — one case, no leading or trailing spaces, one spelling per concept, no stray punctuation.
- **Dates** — one type (`datetime`, not text), one timezone assumption, a known order (is `03/04` March 4th or April 3rd).
- **Numbers** — an actual numeric type, no currency symbols, no thousands separators, one unit (all in dollars, not some in cents).

## Why it exists

Data entry is freeform. Exports add formatting. Locales disagree: the US writes `1,234.56`, much of Europe writes `1.234,56`, and `04/05/2026` is a different day depending on the country. Two systems that both "have a date field" store it three incompatible ways. Until a column is standardized, every operation on it is unreliable.

## How it works

**Strings:**

```python
df["region"] = df["region"].str.strip().str.title()      # "  west " -> "West"
df["email"] = df["email"].str.strip().str.lower()
df["phone"] = df["phone"].str.replace(r"[^\d]", "", regex=True)  # digits only
```

For a column with a handful of known variants, map them explicitly:

```python
region_map = {
    "ny": "New York", "n.y.": "New York", "new york": "New York",
    "calif": "California", "ca": "California",
}
df["region"] = df["region"].str.strip().str.lower().map(region_map).fillna(df["region"])
```

The `.fillna(df["region"])` keeps any value the map did not cover, so you can find the ones you missed with `value_counts()` afterward.

```sql
update customers
set region = trim(initcap(region));

update customers set region = 'New York'
where lower(trim(region)) in ('ny', 'n.y.', 'new york');
```

**Dates:**

```python
df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")   # bad -> NaT
df["order_date"] = pd.to_datetime(df["order_date"], format="%d/%m/%Y", errors="coerce")  # if you know the order
```

Always pass a `format` if you know it. Letting pandas guess is how `01/02/2026` silently becomes January 2nd for half the rows and February 1st for the other half, if the data mixes conventions. After parsing, check the range: `df["order_date"].min()` and `.max()` should be sensible. `errors="coerce"` turns unparseable dates into `NaT`, which you then count and handle.

**Numbers:**

```python
df["revenue"] = (df["revenue"].astype(str)
                 .str.replace(r"[£$,]", "", regex=True)
                 .str.strip())
df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
```

Watch for **unit mismatches**: a column where some rows are dollars and some are cents (values of `19.99` next to `1999`), or weights in kg next to weights in lb. These do not look dirty, they look like outliers, and the fix is to find the rule that separates them and convert one group.

**Whitespace you cannot see:** trailing spaces, tabs, non-breaking spaces (`\xa0`), and zero-width characters. `str.strip()` handles the common ones; for the exotic, `str.replace("\xa0", " ")` first. A column that looks clean but still splits into two groups on `value_counts()` almost always has invisible whitespace.

## When you use it

Early in the cleaning pass, before deduplication (so near-duplicates collapse) and before any grouping or joining (so keys match). It is usually the largest single block of the `clean()` function.

## A worked example

A regional sales file. `df["region"].value_counts()` before cleaning:

```
West       412
west       88
 West      31
West       19    <- trailing space
Weest       3
Northeast  380
NE          64
```

After `.str.strip().str.title()` and a small map for `NE -> Northeast` and `Weest -> West`:

```
West       550
Northeast  444
```

Now a `groupby("region")` gives you two regions instead of seven, and the West total is right. Before this step, "West" sales were understated by a third because they were spread across four spellings.

> **Try This**
> Take the messiest text column in a case dataset. Run `value_counts()`, standardize it (strip, case, explicit map for the rest), and run `value_counts()` again. Then do the same for a date column: parse it with an explicit format and check the min and max are real dates.
