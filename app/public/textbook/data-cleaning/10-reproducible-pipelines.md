# Reproducible cleaning pipelines

## The one-sentence version

A reproducible pipeline is your cleaning written as one function that turns the raw file into the analysis-ready table the same way every time, so next month's run is one command and the logic is reviewable.

## What it is

Instead of a notebook where you clicked through 40 cells in some order, cleaning becomes:

```python
def clean(raw: pd.DataFrame) -> pd.DataFrame:
    ...
    return df
```

One input (the untouched raw data), one output (the clean table), no hidden state, no manual steps. Run it on this month's file, get this month's clean data. Run it on last month's file, get last month's clean data, identical to what you got last month.

## Why it exists

The notebook approach fails in three predictable ways. You rerun cells out of order and get a different result. You lose track of which version of the data a chart was built from. And when the data updates, you redo the whole thing by hand and quietly make different choices than last time, so the trend line moves for reasons that have nothing to do with the business. A function fixes all three: deterministic, versioned with the code, one call to rerun.

## How it works

**Structure the function as a sequence of small, named steps:**

```python
import pandas as pd
from pathlib import Path

RAW = Path("data/raw")

def load() -> pd.DataFrame:
    return pd.read_csv(
        RAW / "orders.csv",
        dtype={"order_id": str, "zip": str},        # keep IDs as text
        parse_dates=["order_date"],
        na_values=["", "n/a", "N/A", "-", "unknown"],  # disguised nulls
    )

def standardise(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    df["region"] = df["region"].str.strip().str.title()
    df["email"] = df["email"].str.strip().str.lower()
    return df

def fix_types(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["amount"] = pd.to_numeric(
        df["amount"].astype(str).str.replace(r"[$,]", "", regex=True), errors="coerce")
    return df

def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["discount"] = df["discount"].fillna(0)
    df["region"] = df["region"].fillna("Unknown")
    df = df.dropna(subset=["order_id", "amount"])
    return df

def dedupe(df: pd.DataFrame) -> pd.DataFrame:
    return df.sort_values("last_updated").drop_duplicates("order_id", keep="last")

def flag_issues(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["flag"] = pd.NA
    df.loc[df["amount"] < 0, "flag"] = "negative_amount"
    df.loc[df["order_date"] > pd.Timestamp.today(), "flag"] = "future_date"
    return df

def clean(raw: pd.DataFrame | None = None) -> pd.DataFrame:
    df = raw if raw is not None else load()
    df = standardise(df)
    df = fix_types(df)
    df = handle_missing(df)
    df = dedupe(df)
    df = flag_issues(df)
    return df
```

**The rules that make it reproducible:**

- **`data/raw/` is read-only.** Every function reads from it or from the previous step's output. Nothing writes back to raw.
- **Each step returns a new DataFrame** (`df = df.copy()` at the top). No in-place mutation, so steps can be reordered or tested individually and the order of execution is explicit in `clean()`.
- **No manual edits.** If you found three rows with a specific typo, fix them in code with a rule (`df.loc[df["x"] == "typo", "x"] = "correct"`), not by editing the CSV.
- **Deterministic.** No `random` without a seed. No "today" baked into a saved file (compute it at run time).
- **Validated.** `clean()` ends by running the validation suite from the previous chapter, or you call `validate(clean())` and assert it is empty.

**Save the output explicitly:**

```python
clean().to_parquet("data/processed/orders_clean.parquet")
```

Analysis reads `data/processed/orders_clean.parquet`, never the raw file, never a DataFrame left in memory from an earlier cell.

**Commit the code, gitignore the data.** The `clean()` function and `CLEANING.md` go in Git. `data/raw/` and `data/processed/` are in `.gitignore`. Code and reasoning are versioned; the data lives beside it.

## When you use it

Once the exploratory cleaning has stabilised. The notebook is fine for figuring out *what* needs doing. The moment the answer is settled, or the moment you know this data will refresh, move the working cells into the pipeline shape so the next run is trustworthy and one command.

## A worked example

A weekly sales dashboard. Version one: a notebook the analyst reruns every Monday, clicking through cells, occasionally in a different order, occasionally skipping the dedup step. Over a quarter the weekly revenue number develops a wobble that turns out to be the analyst sometimes deduplicating and sometimes not.

Version two: `clean()` as above, plus a three-line script:

```python
from pipeline import clean, validate
df = clean()
assert not validate(df)
df.to_parquet("data/processed/sales_clean.parquet")
```

Monday morning is now: drop the new file in `data/raw/`, run the script, refresh the dashboard. Same logic every week. When revenue moves, it moved because the business moved, and the analyst can prove it by pointing at the function that has not changed.

> **Try This**
> Take a completed case and rewrite your cleaning as a `clean()` function with named steps, reading from an untouched raw file and ending with a validation check. Then delete all your scratch cells and confirm the analysis still runs from `clean()` alone. That function is the portfolio artifact.
