# Data type correction

## The one-sentence version

If a column is not the type it should be, every operation on it is either wrong or an error, and the usual cause is one bad value in an otherwise fine column.

## What it is

Making each column the right type:

- **Numeric** (`int`, `float`) for anything you will add, average, or compare in magnitude.
- **Datetime** for anything you will subtract to get a duration or sort chronologically.
- **Boolean** for true/false flags.
- **Category** (pandas) or just clean text for labels, especially identifiers.

The common corrections: text-that-should-be-numeric, text-that-should-be-a-date, numbers-that-should-be-text (IDs, ZIP codes, phone numbers), and `"True"`/`"False"` strings that should be real booleans.

## Why it exists

Type inference is per column and pessimistic: if one value in a numeric column is `"n/a"` or `"1,200"` or `"$50"`, the whole column loads as text. A CSV has no type information at all. A database column might be `VARCHAR` for a field that only ever holds numbers. And IDs that look numeric (`007`, `4155551234`) get loaded as integers, dropping the leading zero or overflowing.

## How it works

**Text to numeric:**

```python
df["price"] = pd.to_numeric(df["price"], errors="coerce")   # unparseable -> NaN
bad = df[df["price"].isna() & df["price_raw"].notna()]       # see what failed
```

`errors="coerce"` is the key: instead of raising on the first bad value, it converts the bad ones to `NaN` so you can inspect them. Keep the original column around (or check before converting) so you can see *what* failed: usually it is `"n/a"`, a currency symbol, a comma, or an empty string, and the fix is to clean those first (previous chapter) then convert.

**Text to datetime:**

```python
df["signup"] = pd.to_datetime(df["signup"], errors="coerce", format="%Y-%m-%d")
```

Same pattern. Pass `format` when you know it. Check `df["signup"].isna().sum()` after; a spike means the format guess was wrong or the data is mixed.

**Numeric to text (for IDs):**

```python
df["zip"] = df["zip"].astype(str).str.zfill(5)     # 8701 -> "08701"
df["product_code"] = df["product_code"].astype(str)
```

Do this on load if you can (`dtype={"zip": str}` in `read_csv`), because once `08701` has been read as `8701` the leading zero is gone and you cannot recover it without knowing the correct width.

**Strings to boolean:**

```python
df["is_active"] = df["is_active"].map({"True": True, "False": False, "Y": True, "N": False, 1: True, 0: False})
```

Map explicitly. Do not rely on `astype(bool)`, which turns the non-empty string `"False"` into `True`.

**In SQL:**

```sql
select cast(nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '') as numeric) from raw;
select cast(order_date as date) from raw;
select lpad(cast(zip as text), 5, '0') from raw;
```

**Downcast only if it matters.** `int64` to `int32`, or `object` to `category`, saves memory on large datasets. For anything under a million rows it rarely matters; do not spend time on it.

## When you use it

Right after standardizing formats: you clean the values (remove the `£`, fix the `"n/a"`), then convert the type, then verify nothing unexpected became null. It is the bridge between "the text looks right" and "I can actually compute with this".

## A worked example

An orders export. `df.dtypes` shows:

```
order_id        int64      <- should be text (leading zeros lost already, note it)
customer_zip    int64      <- same problem
amount          object     <- should be numeric
order_date      object     <- should be datetime
is_gift         object     <- should be boolean
```

The fix:

```python
df["customer_zip"] = df["customer_zip"].astype(str).str.zfill(5)
df["amount"] = pd.to_numeric(df["amount"].str.replace(r"[$,]", "", regex=True), errors="coerce")
df["order_date"] = pd.to_datetime(df["order_date"], format="%m/%d/%Y", errors="coerce")
df["is_gift"] = df["is_gift"].map({"yes": True, "no": False, "": False})

print(df["amount"].isna().sum(), "amounts failed to parse")
print(df["order_date"].isna().sum(), "dates failed to parse")
```

`amount` reports 4 failures: inspecting them, they are `"REFUND"`. Those are not orders, they are refund records mixed in. That is a finding, not a cleaning problem, and it goes in the notes.

> **Try This**
> Run `df.dtypes` on a case dataset. For every column that is the wrong type, write the one-line conversion, run it with `errors="coerce"`, and count what became null. Investigate any column where more than a couple of values failed.
