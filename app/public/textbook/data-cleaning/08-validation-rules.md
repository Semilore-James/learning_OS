# Validation rules

## The one-sentence version

A validation rule is a statement that must be true of clean data, written as code that fails loudly when it is not, so bad data gets caught the moment it arrives instead of in a meeting.

## What it is

A checklist of assertions about a dataset, each one a small test:

- **Not null:** `order_id` is never missing.
- **Unique:** `order_id` has no duplicates.
- **Range:** `age` is between 0 and 120; `discount_pct` is between 0 and 1.
- **Set membership:** `status` is one of `{pending, shipped, delivered, cancelled}`.
- **Format:** `email` matches an email pattern; `zip` is 5 digits.
- **Cross-field:** `ship_date >= order_date`; `total = quantity * unit_price` (within a rounding tolerance); if `status = 'cancelled'` then `cancelled_at` is not null.
- **Referential:** every `customer_id` in orders exists in the customers table.
- **Aggregate:** row count is within an expected range; the sum of `amount` reconciles with an independent total.

## Why it exists

Cleaning a file once fixes that file. Validation rules fix the process: next month's file gets checked the same way, automatically, and you find out about the broken import on Tuesday morning instead of when the CFO asks why revenue looks wrong. They also document your assumptions. "Every order has a customer" is an assumption; writing it as a rule makes it explicit and testable.

## How it works

**Write each rule as a query or an assertion that returns the violations:**

```sql
-- should return zero rows each
select * from orders where order_id is null;
select order_id, count(*) from orders group by order_id having count(*) > 1;
select * from orders where age not between 0 and 120;
select * from orders where status not in ('pending','shipped','delivered','cancelled');
select * from orders where ship_date < order_date;
select * from orders where abs(total - quantity * unit_price) > 0.01;
select o.* from orders o left join customers c on o.customer_id = c.id where c.id is null;
```

```python
def validate(df):
    problems = []
    if df["order_id"].isna().any():
        problems.append(f"{df['order_id'].isna().sum()} rows missing order_id")
    if df["order_id"].duplicated().any():
        problems.append(f"{df['order_id'].duplicated().sum()} duplicate order_id")
    bad_age = ~df["age"].between(0, 120)
    if bad_age.any():
        problems.append(f"{bad_age.sum()} rows with age out of 0-120")
    bad_status = ~df["status"].isin(["pending", "shipped", "delivered", "cancelled"])
    if bad_status.any():
        problems.append(f"{bad_status.sum()} rows with unknown status: {df.loc[bad_status,'status'].unique()}")
    mismatch = (df["total"] - df["quantity"] * df["unit_price"]).abs() > 0.01
    if mismatch.any():
        problems.append(f"{mismatch.sum()} rows where total != quantity * unit_price")
    return problems

issues = validate(df)
assert not issues, "\n".join(issues)
```

For anything you run regularly, a library (Great Expectations, pandera, or dbt tests for warehouses) turns this into a maintained suite with a report. For a one-off, the function above is enough.

**Decide the severity per rule.** Some rules should stop the pipeline (missing primary keys, referential breaks). Others should warn and continue (a handful of ages over 120, log them for review). Do not treat every violation as fatal or you will disable the checks the first time one is noisy.

**Run validation twice:** once on the raw data (to see what came in), once after cleaning (to prove the cleaning worked). The second run should be all green.

## When you use it

Build the rule set once, from what you learned during the first cleaning pass, then run it on every subsequent load of the same data. Also run it after any join or transformation that could break an invariant (a join can create duplicates; a filter can orphan a foreign key).

## A worked example

A monthly finance export. The validation suite has 9 rules. This month, two fail:

- `12 rows where total != quantity * unit_price` — investigating, all 12 have a `line_discount` that the `total` accounts for but the simple `quantity * unit_price` check does not. The rule was wrong, not the data. Fix the rule to `total = quantity * unit_price - line_discount`.
- `3 rows with status "returned"` — a genuinely new status the ops team added last week and did not tell anyone. Add `returned` to the allowed set, and now every downstream report that filters by status knows to handle it.

Both failures were caught in 30 seconds by running the suite, before the numbers went anywhere. Without it, the discount issue would have surfaced as a reconciliation gap and the new status would have silently dropped rows from every `status IN (...)` filter.

> **Try This**
> For a case dataset, write 5 validation rules: one not-null, one uniqueness, one range, one set-membership, one cross-field. Run them. Any rule that fails is either a data problem to note or a wrong assumption to correct, and both are worth knowing.
