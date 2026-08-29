# Importing libraries and NumPy basics

## The one-sentence version

`import` pulls in code other people wrote, and NumPy is the one under everything, a fast array of numbers that pandas is built on and that you occasionally use directly.

## What it is

A **library** (or package) is a bundle of reusable code. You install it once with `pip`, then `import` it in any script that needs it. **NumPy** is the numerical library: it provides the `ndarray`, a fixed-type array that does math on the whole thing at once, far faster than a Python list.

## Why it exists

Python's built-in lists are flexible but slow for math: adding two lists of a million numbers means a million individual operations. NumPy stores numbers in a tight block and operates on the block in one go, in optimised C. Every serious data library (pandas, scikit-learn, matplotlib) sits on NumPy. You mostly meet it through pandas, but knowing the array model explains why pandas works the way it does.

## How it works

**Importing:**

```python
import pandas as pd            # the standard alias
import numpy as np
from pathlib import Path        # import one name from a module
import matplotlib.pyplot as plt
```

`import x as y` gives it a short name. `from x import y` pulls one thing out. If you get `ModuleNotFoundError`, the package is not installed in the environment you are running, `pip install <name>` and check your virtual environment is active.

**NumPy arrays:**

```python
import numpy as np

a = np.array([10, 20, 30, 40])
a * 2                 # array([20, 40, 60, 80])   -- whole array at once
a + a                 # array([20, 40, 60, 80])
a.sum(), a.mean(), a.std(), a.min(), a.max()
a[a > 20]             # array([30, 40])  -- boolean filtering
```

The key idea is **vectorisation**: `a * 2` multiplies every element with no loop you write. This is why pandas code is fast, `df["price"] * df["units"]` is one vectorised operation over the whole column.

**Useful NumPy functions you will see in pandas code:**

- `np.where(condition, if_true, if_false)`: element-wise choice. `df["tier"] = np.where(df["revenue"] > 500, "big", "small")`.
- `np.nan`: the floating-point "not a number", how missing numeric values are represented. `np.isnan(x)` tests for it. `df["x"].fillna(0)` in pandas replaces it.
- `np.round`, `np.clip(a, low, high)` (cap values into a range), `np.log`, `np.sqrt`.
- `np.random.seed(42)` then `np.random.normal(...)`: reproducible random data for testing.

**Arrays are fixed-type.** `np.array([1, 2, "x"])` coerces everything to strings. A NumPy array is all ints, or all floats, or all strings. pandas columns work the same way, which is why a numeric column with one stray text value loads as `object` (text).

## When you use it

Directly: rarely, and mostly `np.where` and `np.nan`. Indirectly: every time you touch pandas. The reason to learn it is that "operate on the whole column at once, never loop" is the single most important habit for writing pandas that is not painfully slow.

## A worked example

```python
import numpy as np
import pandas as pd

df = pd.DataFrame({"units": [5, -2, 8, 0], "price": [100, 100, 100, 100]})
df["revenue"] = df["units"] * df["price"]          # vectorised
df["flag"] = np.where(df["units"] < 0, "return", "ok")
df["units"] = df["units"].clip(lower=0)            # floor negatives at 0
```

No loop. Every column operation applies to all rows at once.

> **Try This**
> Load a case dataset. Create a revenue column with `df["a"] * df["b"]` and a category column with `np.where(...)`. Time it against writing the same thing as a `for` loop over rows and see the difference.
