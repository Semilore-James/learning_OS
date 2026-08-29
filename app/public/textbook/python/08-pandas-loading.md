# Pandas: loading CSVs and Excel files

## The one-sentence version

`pd.read_csv` and `pd.read_excel` turn a file into a DataFrame, and the arguments you pass them fix most problems before they become cleaning work.

## What it is

A **DataFrame** is pandas' table: named columns, a row index, each column one type. Loading is the step that reads a file off disk into a DataFrame. The main readers are `read_csv`, `read_excel`, `read_parquet`, `read_json`, and `read_sql`.

## Why it exists

You could open the file, loop the lines, and split on commas. `read_csv` does that plus type inference, encoding handling, header detection, date parsing, and a hundred edge cases, all controlled by keyword arguments. Getting the load right saves you from cleaning problems you created by loading wrong.

## How it works

**The basics:**

```python
import pandas as pd

df = pd.read_csv("sales.csv")
df = pd.read_excel("report.xlsx", sheet_name="Q3")
```

**The arguments that matter:**

- `parse_dates=["order_date", "ship_date"]`: read these columns as real dates, not text. Do this at load time; converting later is more work.
- `dtype={"zip": str, "product_code": str}`: force a column's type. Essential for ID and code columns that look numeric but must not lose leading zeros (`00123` becoming `123`).
- `usecols=["date", "store", "revenue"]`: read only the columns you need. On a wide file this is a big speed and memory win.
- `nrows=1000`: read just the first N rows to peek at a huge file before committing.
- `skiprows=3` or `header=2`: the real header is not on line 1 (a title block above it).
- `na_values=["N/A", "-", "missing", ""]`: treat these strings as missing, not as text.
- `thousands=","`: numbers written as `1,200` become `1200` not text.
- `encoding="latin-1"`: fixes `UnicodeDecodeError` on files with non-UTF-8 characters (common from Excel exports).
- `sep=";"` or `sep="\t"`: the file is not comma-separated.

**Reading multiple Excel sheets:**

```python
sheets = pd.read_excel("report.xlsx", sheet_name=None)   # dict of {name: DataFrame}
q3 = sheets["Q3"]
```

**Reading a folder of CSVs:**

```python
from pathlib import Path
files = Path("exports").glob("*.csv")
df = pd.concat([pd.read_csv(f).assign(source=f.name) for f in files], ignore_index=True)
```

`concat` stacks them; `.assign(source=f.name)` records which file each row came from.

**Right after loading, always:**

```python
df.shape          # (rows, columns)
df.head()         # first 5 rows
df.dtypes         # what type is each column
```

If a column you expected to be numeric shows `object`, something in it is text, and you want to know before you compute.

## When you use it

Every analysis starts here. Spend the extra minute on the load arguments (`parse_dates`, `dtype`, `na_values`), because a date column loaded as text or an ID column that lost its zeros is a bug you will chase for an hour later.

## A worked example

A transactions export has a two-line title block, dates as text, product codes with leading zeros, and `"n/a"` scattered in the price column:

```python
df = pd.read_csv(
    "transactions.csv",
    skiprows=2,
    parse_dates=["transaction_date"],
    dtype={"product_code": str},
    na_values=["n/a", "N/A", "-"],
)
```

One call, and the DataFrame is already close to clean.

> **Try This**
> Load a case dataset with the plain `pd.read_csv(path)`, check `df.dtypes`, then reload it with `parse_dates`, `dtype`, and `na_values` set correctly and compare. Note what changed.
