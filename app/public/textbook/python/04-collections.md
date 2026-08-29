# Lists, tuples, dictionaries

## The one-sentence version

A list is an ordered bag of things you can change, a tuple is one you cannot, and a dictionary maps keys to values, and together they hold almost every small piece of data your code passes around.

## What it is

- **List:** `["North", "South", "East"]`. Ordered, indexed from 0, mutable (you can add, remove, reorder).
- **Tuple:** `(4200, "USD")`. Like a list but fixed once created. Used for a small fixed group, like a coordinate or a return value.
- **Dictionary:** `{"region": "West", "revenue": 4200}`. A set of `key: value` pairs. Look up by key, not position.

## Why it exists

Before your data is a pandas table, it is often one of these. A list of column names to keep. A dictionary mapping old category values to clean ones. A list of dictionaries you build up and then hand to pandas as rows. They are the plumbing.

## How it works

**Lists:**

```python
regions = ["North", "South", "East"]
regions[0]            # "North"
regions[-1]           # "East"  (negative counts from the end)
regions[1:3]          # ["South", "East"]  (slice)
regions.append("West")
regions.remove("South")
len(regions)          # 3
"East" in regions     # True
sorted(regions)       # a new sorted list
```

A **list comprehension** builds a list from another in one line, and you will use it constantly:

```python
[r.upper() for r in regions]                    # ["NORTH", "EAST", "WEST"]
[r for r in regions if r != "West"]             # filter while building
[len(r) for r in regions]                        # transform
```

**Tuples:**

```python
point = (10, 20)
x, y = point          # unpacking: x=10, y=20
```

You cannot do `point[0] = 5`. Use a tuple when the group should not change, or as a dictionary key (lists cannot be keys, tuples can).

**Dictionaries:**

```python
row = {"region": "West", "units": 12, "price": 2950}
row["region"]              # "West"
row.get("discount", 0)     # 0  (default when the key is missing, no error)
row["revenue"] = row["units"] * row["price"]   # add a key
row.keys(), row.values(), row.items()

for key, value in row.items():
    print(key, value)
```

`row["missing"]` throws `KeyError`; `row.get("missing")` returns `None`; `row.get("missing", 0)` returns your default. Use `.get()` when a key might not be there.

**A dictionary as a lookup / mapping:**

```python
clean = {"w": "West", "west": "West", "W": "West"}
messy = ["w", "West", "north", "W"]
[clean.get(m, m) for m in messy]   # ["West", "West", "north", "West"]
```

This exact pattern, a dict of corrections plus `.get(x, x)` to leave unknowns alone, is how you standardise a category column.

**Sets** (`{1, 2, 3}`) are the last one: unordered, no duplicates. `set(a) - set(b)` gives what is in `a` but not `b`, handy for "which ids are missing".

## When you use it

Lists for any sequence you are building or iterating. Dictionaries for any "given this, get that" mapping and for representing one record. Tuples for fixed small groups and multiple return values. Sets for membership and difference checks.

## A worked example

You need to build a small table by hand and hand it to pandas:

```python
import pandas as pd
rows = [
    {"store": "Ikeja", "revenue": 121000},
    {"store": "Lekki", "revenue": 208000},
    {"store": "Yaba",  "revenue": 197000},
]
df = pd.DataFrame(rows)
```

A list of dictionaries becomes a DataFrame with one row per dict and columns from the keys. This is how you turn scraped or API data into a table.

> **Try This**
> Build a dict that maps the messy category values in a case dataset to their clean form. Apply it to a list of the raw values with a comprehension. Then build a small `list` of `dict`s by hand and turn it into a DataFrame.
