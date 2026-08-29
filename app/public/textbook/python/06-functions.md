# Functions and scope

## The one-sentence version

A function is a named, reusable block of logic that takes inputs and returns a result, and writing your analysis as a few small functions makes it testable, readable, and re-runnable.

## What it is

```python
def revenue(units, price):
    return units * price

revenue(12, 2950)   # 35400
```

`def` names it, the parentheses list the **parameters**, the indented block is the body, `return` sends a value back. Calling it with **arguments** runs the body and gives you the result.

## Why it exists

A script that is one long sequence of steps is hard to read, hard to test, and hard to reuse. Break it into functions (`load_data()`, `clean(df)`, `summarise(df)`) and each piece has a name that says what it does, can be tested on its own, and can be called again. The finished analysis reads like a table of contents.

## How it works

**Parameters and defaults:**

```python
def clean(df, drop_negatives=True):
    if drop_negatives:
        df = df[df["units"] >= 0]
    return df

clean(df)                       # uses the default
clean(df, drop_negatives=False) # overrides it
```

Parameters with defaults come after those without. Passing arguments by name (`drop_negatives=False`) is clearer than by position when there are several.

**Return.** A function without `return` gives back `None`. You can return several values as a tuple:

```python
def summarise(df):
    total = df["revenue"].sum()
    n = len(df)
    return total, n

total, count = summarise(df)
```

**Docstrings.** The string right under `def` documents it:

```python
def flag_bad_rows(df):
    """Return df with a 'flag' column marking negative units and total mismatches."""
    ...
```

**Scope.** Variables created inside a function exist only inside it. The function can *read* names from the enclosing script, but assigning to a name inside makes a new local one. This is a feature: a function's internals cannot accidentally clobber your script's variables. If a function needs a value, pass it as a parameter rather than relying on it being "around".

```python
tax = 0.075
def with_tax(price):
    return price * (1 + tax)   # reads the outer `tax` — works, but...

def with_tax(price, tax):      # better: tax is an explicit input
    return price * (1 + tax)
```

**Pure functions are easier to trust.** A function that takes inputs, returns an output, and touches nothing else (no printing, no file writing, no modifying its arguments in place) can be tested by just checking `f(x) == expected`. Aim for that shape for your transformation steps; keep the file-reading and printing at the edges.

**A note on mutating arguments:** if you pass a DataFrame or list into a function and modify it in place, the caller's copy changes too. To be safe, do `df = df.copy()` at the top of a function that transforms, or return a new object and reassign.

## When you use it

The moment a piece of logic is used twice, or a script gets long enough that you scroll to understand it. A good analysis notebook or script is: a few functions defined at the top, then a short "main" section that calls them in order.

## A worked example

```python
import pandas as pd

def load(path):
    return pd.read_csv(path, parse_dates=["date"])

def clean(df):
    df = df.copy()
    df["store"] = df["store"].str.strip().str.title()
    df = df[df["units"] >= 0]
    return df

def revenue_by_store(df):
    return df.groupby("store")["revenue"].sum().sort_values(ascending=False)

df = load("sales.csv")
df = clean(df)
print(revenue_by_store(df))
```

The last three lines are the whole analysis. Everything above them is named, testable, and reusable next month.

> **Try This**
> Refactor a case analysis into `load`, `clean`, and `summarise` functions. Then call `clean` on a tiny hand-made DataFrame and check the output is what you expect. That check is a test.
