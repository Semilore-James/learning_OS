# Writing output and structuring an end-to-end project

## The one-sentence version

A finished analysis is a folder with the raw data untouched, a script or notebook that turns it into the result, and the output saved to a file, so anyone can rerun it and get the same answer.

## What it is

The shape of a small analytics project: where files go, what the code does start to finish, and how the result leaves your machine. Not a framework, just a layout that makes the work reproducible and reviewable.

## Why it exists

An analysis that lives only in a notebook you ran once, with cells in a scrambled order and the raw file already overwritten, cannot be trusted or repeated. A little structure means: the number can be reproduced, the cleaning can be audited, and next month's run is one command.

## How it works

**A folder layout:**

```
sales-analysis/
  data/
    raw/          <- the original files, never edited
    processed/    <- cleaned output, safe to delete and regenerate
  notebooks/
    explore.ipynb <- messy, for looking
  src/
    pipeline.py   <- clean and settled, for running
  output/
    revenue_by_store.csv
    finding.png
  README.md       <- what this is, how to run it
```

The rule that matters: **`data/raw/` is read-only**. Every transformation reads from raw and writes somewhere else. If a step corrupts the data, you rerun; you never lose the source.

**The pipeline, as functions:**

```python
# src/pipeline.py
import pandas as pd
from pathlib import Path

RAW = Path("data/raw")
OUT = Path("output")

def load():
    return pd.read_csv(RAW / "transactions.csv", parse_dates=["date"],
                       dtype={"product_code": str}, na_values=["n/a", "-"])

def clean(df):
    df = df.copy()
    df["store"] = df["store"].str.strip().str.title()
    df = df.drop_duplicates("transaction_id")
    df["revenue"] = (df["units"] * df["unit_price"]).round(2)
    return df

def summarise(df):
    return (df.groupby("store")["revenue"].sum()
              .sort_values(ascending=False).round(0).reset_index())

def main():
    df = clean(load())
    summary = summarise(df)
    OUT.mkdir(exist_ok=True)
    summary.to_csv(OUT / "revenue_by_store.csv", index=False)
    print(summary)

if __name__ == "__main__":
    main()
```

`python src/pipeline.py` runs the whole thing. `if __name__ == "__main__":` means the functions can also be imported and tested without running `main()`.

**Writing output:**

```python
summary.to_csv("output/revenue_by_store.csv", index=False)   # index=False almost always
summary.to_excel("output/summary.xlsx", sheet_name="by_store", index=False)
df.to_parquet("data/processed/clean.parquet")               # for large data you will reload
fig.savefig("output/finding.png", dpi=150, bbox_inches="tight")
```

`index=False` on CSV/Excel stops pandas writing the row numbers as a stray first column.

**The README** says, in a few lines: what question this answers, where the data came from, how to run it (`pip install -r requirements.txt`, then `python src/pipeline.py`), and where the output lands. Future-you and any reviewer start here.

**Version control it** (see the Git track): commit the code and the README, `.gitignore` the `data/` folder and `output/`. Code and instructions in Git; data stays out.

## When you use it

Any analysis you will hand to someone, rerun later, or be asked to defend. The notebook is fine for figuring it out; once the answer is settled, move the working cells into a pipeline with this shape.

## A worked example

The end state of a case: `data/raw/` holds the untouched CSVs, `src/pipeline.py` loads, cleans, and produces `output/revenue_by_store.csv` and `output/finding.png`, and `README.md` explains that Ikeja is 33% below the next store because of off-book cash discounting, with instructions to reproduce. That folder is your portfolio piece.

> **Try This**
> Take a completed case and package it into this layout: raw data untouched, a `pipeline.py` with `load`/`clean`/`summarise`/`main`, output saved to files, and a README. That is what you attach to a job application.
