# Why Python for data

## The one-sentence version

Python is the tool you reach for when the data is bigger than a spreadsheet likes, when you need to run the same analysis a hundred times, or when the answer requires something Excel and SQL cannot do on their own.

## What it is

Python is a general-purpose programming language. For analysts, "Python" usually means Python plus a few libraries: **pandas** for tables, **numpy** for numbers, **matplotlib** / **seaborn** / **plotly** for charts. You write short scripts or notebooks that load data, transform it, and produce a result.

## Why it exists (for an analyst)

You already have Excel and SQL. Python earns its place in three situations:

1. **Scale.** Excel gets slow and unstable past a few hundred thousand rows. pandas handles millions comfortably on a laptop.
2. **Repetition.** A cleaning-and-reporting pipeline you run every week is a script you run with one command, not twenty minutes of clicking. It does the same thing every time.
3. **Reach.** Pulling from an API, scraping a page, joining ten files, running a statistical model, building an interactive chart. These are a line or two in Python and awkward or impossible elsewhere.

You do not stop using Excel and SQL. You add Python for the jobs they are bad at.

## How it works

A Python data workflow, at the shape level:

```python
import pandas as pd

df = pd.read_csv("sales.csv")          # load
df = df[df["units"] > 0]               # filter
by_store = df.groupby("store")["revenue"].sum()   # aggregate
by_store.to_csv("summary.csv")         # save
```

Four lines: load, filter, aggregate, save. That is the same four moves you make in Excel or SQL, written as code. The value is that the code is a record of exactly what you did, it runs again in a second, and it does not care whether `sales.csv` has 5,000 rows or 5,000,000.

You run this either in a **notebook** (Jupyter: cells you run one at a time, output shown inline, good for exploring) or as a **script** (a `.py` file you run start to finish, good for a pipeline that should just work).

## When you use it

- The file is too big for Excel, or Excel is crashing.
- You are doing the same manual analysis more than a couple of times.
- The task needs an API, the web, a real join across many sources, or a model.
- You want the analysis to be reproducible and reviewable, not a spreadsheet nobody can audit.

If none of those apply, Excel or SQL is probably faster and there is no shame in that.

## A worked example

A subscription business exports 400,000 transaction rows a month. In Excel, opening it takes a minute and every pivot recalculation is painful. In Python:

```python
import pandas as pd
df = pd.read_parquet("transactions.parquet")
monthly = (df.assign(month=df["date"].dt.to_period("M"))
             .groupby("month")["amount"].sum())
print(monthly)
```

Instant. And next month you change nothing, you point it at the new file. The analyst who did this in Excel is still waiting for the pivot to refresh.

> **Try This**
> There is nothing to build yet. Note which of your recent tasks would have been better in Python: too big, too repetitive, or needed something Excel could not reach. Those are your first Python projects.
