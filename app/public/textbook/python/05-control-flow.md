# Control flow: if, for, while

## The one-sentence version

`if` makes the code choose, `for` makes it repeat once per item, and `while` makes it repeat until a condition changes, and between them your script can react to whatever the data contains.

## What it is

Control flow is how a program decides what to do next. Without it, a script is a fixed list of steps. With it, the script can branch ("if the file is empty, stop") and loop ("for each row, check it").

## Why it exists

Data is never exactly what you expect. Some rows are missing a value, some files are the wrong shape, some categories are new. `if` lets you handle each case. `for` lets you apply the same logic to a thousand rows without writing it a thousand times. In practice you will lean on pandas to do most looping for you, but you still need `if`/`for` for the parts pandas does not cover, and for understanding what pandas is doing.

## How it works

**Indentation is the syntax.** Python has no braces. The block under an `if` or `for` is defined by being indented (4 spaces, consistently). When the indentation stops, the block is over.

**if / elif / else:**

```python
if revenue >= 500_000:
    tier = "large"
elif revenue >= 100_000:
    tier = "medium"
else:
    tier = "small"
```

Conditions use `==` `!=` `<` `>` `<=` `>=`, combined with `and` `or` `not`. `if not name:` is true when `name` is empty, `None`, `0`, or `""` (all "falsy").

**for over a list:**

```python
for region in ["North", "South", "East"]:
    print(region)
```

**for over a range:**

```python
for i in range(5):        # 0, 1, 2, 3, 4
    ...
```

**for over a dictionary:**

```python
for key, value in row.items():
    ...
```

**Building a result in a loop:**

```python
totals = {}
for r in rows:
    region = r["region"]
    totals[region] = totals.get(region, 0) + r["revenue"]
```

That is a group-by written by hand. pandas does it in one line, but this is what "group by" means.

**Skipping and stopping:** `continue` jumps to the next iteration, `break` exits the loop entirely.

```python
for r in rows:
    if r["revenue"] is None:
        continue          # skip rows with no revenue
    if r["revenue"] < 0:
        print("bad row, stopping")
        break
```

**while:**

```python
attempts = 0
while attempts < 3:
    ...
    attempts += 1
```

Use `while` when you do not know how many iterations you need up front (retrying a request, reading until end of file). Make sure the condition can become false, or you have an infinite loop.

**enumerate and zip:**

```python
for i, region in enumerate(regions):   # i is the index, region the value
    ...
for region, total in zip(regions, totals):   # walk two lists together
    ...
```

## When you use it

`if` for handling the cases in your data. `for` for the logic pandas cannot express, or for iterating over files, sheets, or API pages. `while` for retry loops and reading-until-done. If you find yourself writing a `for` loop over a DataFrame's rows to compute something, stop, pandas almost certainly has a vectorised way.

## A worked example

Check a list of records and sort them into good and flagged:

```python
good, flagged = [], []
for r in rows:
    if r.get("units", 0) < 0:
        flagged.append((r["id"], "negative units"))
    elif r.get("total") != r.get("units", 0) * r.get("price", 0):
        flagged.append((r["id"], "total mismatch"))
    else:
        good.append(r)

print(f"{len(good)} ok, {len(flagged)} flagged")
```

This is the same logic Data Detective tests, written as a loop.

> **Try This**
> Loop the rows of a small case dataset (loaded as a list of dicts) and build a flag list for the defects Data Detective looks for. Count how many you find, then check against playing the game by eye.
