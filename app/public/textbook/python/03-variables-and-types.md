# Variables and data types

## The one-sentence version

A variable is a name for a value, and the value's type (number, text, boolean, date) decides what you can do with it and where things go wrong.

## What it is

`revenue = 4200` binds the name `revenue` to the integer `4200`. From then on, `revenue` stands for that value. `=` is assignment, not equality. The value has a **type**, and Python tracks it for you.

## Why it exists

Code without variables is just a calculator. Variables let you name intermediate results, reuse them, and change one input at the top of a script and have everything downstream update. Types matter because `"5" + "5"` is `"55"` (text joined) while `5 + 5` is `10`, and a column of numbers that loaded as text will not sum.

## How it works

**The core types:**

| Type | Example | Notes |
|---|---|---|
| `int` | `4200` | whole numbers, unlimited size |
| `float` | `3.14`, `4.2e6` | decimals, approximate (never use for money at the cent) |
| `str` | `"West"`, `'2024-06-01'` | text, single or double quotes |
| `bool` | `True`, `False` | note the capitals |
| `None` | `None` | "no value", Python's null |

**Check a type:** `type(revenue)` returns `<class 'int'>`. `isinstance(revenue, int)` returns `True`.

**Convert:** `int("42")` gives `42`. `float("3.14")` gives `3.14`. `str(42)` gives `"42"`. A bad conversion raises: `int("N/A")` throws `ValueError`. This is the most common bug when reading messy data, a column of numbers with a stray `"n/a"` in it.

**Strings:**

```python
name = "  West  "
name.strip()            # "West"
name.strip().upper()    # "WEST"
"West" in "Western"     # True
f"Revenue: {revenue:,}" # "Revenue: 4,200"  (f-string, the way to build text)
```

f-strings (`f"..."`) let you drop variables straight into text with `{}`, and `{revenue:,}` adds thousands separators, `{rate:.1%}` formats as a percent.

**Numbers:**

```python
17 / 5      # 3.4   (always a float)
17 // 5     # 3     (floor division)
17 % 5      # 2     (remainder)
2 ** 10     # 1024  (power)
round(3.14159, 2)  # 3.14
```

**None** is not `0` and not `""`. `x is None` is how you test for it (not `x == None`). It appears constantly in real data as a missing value, and `None + 1` throws.

**Dynamic typing:** a variable can hold an int now and a string later. Python does not stop you. That flexibility is convenient and also how a variable ends up the wrong type without you noticing, so keep an eye on what your names actually hold.

## When you use it

Every line. The type awareness matters most right after loading data (is this column numbers or text?) and when building output strings for a report.

## A worked example

```python
units = 12
price = 2950
revenue = units * price            # 35400, an int
discount_rate = 0.1                 # a float
final = revenue * (1 - discount_rate)  # 31860.0, now a float
summary = f"{units} units at {price:,} = {final:,.0f} after discount"
# "12 units at 2,950 = 31,860 after discount"
```

Each name holds a value of a known type; the f-string turns them into a sentence for the report.

> **Try This**
> Take three values from a case dataset (a count, a price, a category). Assign them to variables, compute a revenue, and build a one-line summary string with an f-string. Then try `int("not a number")` and read the error.
