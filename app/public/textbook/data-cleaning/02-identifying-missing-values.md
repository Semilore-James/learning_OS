# Identifying missing values

## The one-sentence version

Finding missing data is harder than it sounds, because half of it is not blank: it is disguised as a zero, a placeholder string, or a suspiciously round number.

## What it is

A missing value is a cell that should hold a real observation but does not. It comes in two forms:

- **Explicit** — an actual blank, `NULL`, `NaN`, `NaT`, empty string.
- **Disguised** — a value was entered *instead of* leaving it blank: `0`, `-1`, `999`, `9999`, `"N/A"`, `"unknown"`, `"none"`, `"-"`, `"TBD"`, a single space, `1900-01-01`, `1970-01-01`.

Disguised missing values are dangerous because every tool treats them as real. A column of ages where "unknown" was coded as `0` will report a mean age that is too low and a minimum of `0`, and nothing will warn you.

## Why it exists

Forms often will not submit with a blank field, so people type something. Legacy systems used sentinel values before proper null support existed. Import tools convert blanks to `0` for numeric columns. An analyst upstream "filled in" the gaps and did not say so. The result is that a raw `isna()` count is almost always an undercount.

## How it works

**Step 1: count the explicit missing.**

```python
df.isna().sum()                    # per column
df.isna().mean().sort_values()     # as a fraction, easier to scan
df.isna().sum().sum()              # total cells missing
```

```sql
select
  count(*) - count(age)        as age_missing,
  count(*) - count(email)      as email_missing,
  count(*) - count(signup_date) as signup_missing
from users;
```

**Step 2: hunt for the disguised ones.** For every column, look at the extremes and the most common values.

```python
for col in df.select_dtypes("number"):
    print(col, df[col].min(), df[col].max(), (df[col] == 0).sum())

for col in df.select_dtypes("object"):
    print(col, df[col].value_counts(dropna=False).head(5).to_dict())
```

You are looking for: a numeric minimum that is `0` or `-1` where that makes no sense; a spike of one round number (`9999` appearing 200 times); text values like `"N/A"`, `"unknown"`, `"."`; a date column with a wall of `1900-01-01`.

**Step 3: decide whether "missing" is actually information.** Sometimes a blank is a fact. `discount` is blank because there was no discount. `cancelled_date` is blank because the order was not cancelled. `assigned_agent` is blank because the ticket is unassigned, which is a real state you may want to analyse. Do not fill these; they mean zero, or "not yet", or a category called "none".

**Step 4: check whether the missingness has a pattern.** Are the nulls random, or concentrated?

```python
df[df["income"].isna()].describe()          # do null-income rows differ?
df.groupby("signup_source")["income"].apply(lambda s: s.isna().mean())
```

If income is missing far more often for one signup source, that is not random, and dropping those rows would bias the analysis toward the other sources. This distinction (missing completely at random vs missing for a reason) drives everything in the next chapter.

## When you use it

Right after the five-minute triage, before deciding on any fill strategy. You cannot choose how to handle missing data until you know how much there is, where the disguised ones are hiding, and whether the gaps are random.

## A worked example

A customer table, 20,000 rows. `df.isna().sum()` reports `birth_year` missing in 1,200 rows (6%). Looks manageable.

Then the disguised-value hunt: `df["birth_year"].value_counts().head()` shows `1900` appearing 3,400 times and `0` appearing 900 times. The form used to default to `1900`, and a later version used `0`. The real missing rate for `birth_year` is not 6%, it is `(1200 + 3400 + 900) / 20000 = 27.5%`.

That changes the plan completely. At 6% you might drop the rows. At 27.5% you cannot; you either impute carefully, treat "age unknown" as its own segment, or drop the `birth_year` analysis entirely and note why.

> **Try This**
> For a case dataset, produce the true missing-value count per column: explicit blanks plus every disguised value you can find. For one column with meaningful gaps, check whether the missingness is random by comparing the null rows to the rest.
