# Case 01 — Retail Sales Audit

**Industry:** Retail · **Difficulty:** ROOKIE

## The situation

A regional chain of six garden centres has handed you a year of transaction data in a single spreadsheet and a vague ask from the operations manager: "Something is off with our numbers versus what the stores are telling me. Can you check it and tell me what stands out?"

There is no specific question yet. Part of the job is finding the questions worth asking, then answering them.

## The data

One sheet, `transactions`, roughly 40,000 rows.

| column | example | notes |
|---|---|---|
| date | 2025-06-03 | transaction date |
| store | Ikeja | one of six store names |
| category | Plants | Plants, Tools, Soil, Pots, Furniture, Other |
| units | 3 | |
| unit_price | 4500 | in NGN |
| discount_pct | 0.1 | fraction, 0 to 1 |
| payment_method | card | card, cash, transfer |

Known issues you should expect: some `unit_price` values are blank, a few `store` names are misspelled, and there is at least one row with `units` of 0.

## Deliverables

1. **Clean the data.** Document every cleaning decision: what you found, what you did, and why. Keep a "removed / corrected" count.
2. **Revenue by store and category.** A pivot table of net revenue (after discount) by store (rows) and category (columns), plus a total column and row.
3. **What stands out.** Three findings the operations manager should look into, each one sentence, each backed by a number from your pivot. At least one should be about the data quality itself.

## What "done" looks like

A cleaned sheet, a pivot table, a short "cleaning log", and three findings. The findings are the point; the pivot is how you got there.

## Submit

Describe your cleaning decisions and paste your three findings below, then submit for PM-AI review.
