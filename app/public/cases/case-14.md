# Case 14 — Retail Inventory Shrinkage

**Industry:** Retail · **Difficulty:** ANALYST

## The situation

The finance controller for a five-store chain:

> "Our stock write-offs are up and I can't tell if it's theft, breakage, or bad
> paperwork. I need to know if it's a real problem, where, and roughly how big."

## The data

`stock_movements.csv` — every stock event across the year (~18k rows).

| column | notes |
|---|---|
| date, store, category, sku | |
| movement_type | sale, receipt, return, count |
| qty | signed — negative for sales |
| counted_delta | on `count` rows: physical count minus expected |

## How to approach it

For each store and category, you can track *expected* stock over time by summing
the signed `qty` of receipts, sales and returns. The `count` rows tell you what
was physically there.

Shrinkage shows up as `counted_delta` running persistently negative — the shelf
has less than the books say, again and again, not just noise around zero.

Aggregate `counted_delta` by store and category. Most combinations will hover
near zero. One store-category will drift steadily negative across the year.
Quantify it — units and rough value — and say whether the pattern looks like
one-off breakage or steady loss.

## What to hand back

- total counted shortfall by store and category
- the one store-category with a real problem, sized in units and value
- your read: one-off or ongoing, and what to check next

## Submit

Paste your analysis below, then send it to your PM.
