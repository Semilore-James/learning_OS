# Case 16 — Supply Chain Delay Tracker

**Industry:** Manufacturing · **Difficulty:** SENIOR

## The situation

Head of procurement:

> "The supplier scorecard says Globex is our most reliable and a small vendor
> called Acme is our worst. We're about to shift volume to Globex. I've worked
> with Acme for ten years and that doesn't match my gut. Check it."

## The data

`purchase_orders.csv` — one row per PO (~26k rows).

| column | notes |
|---|---|
| po_id, supplier | supplier names are **not standardised** — "Acme", "Acme Ltd", "ACME", "Acme  Ltd." |
| created_date, promised_date, received_date | some promised dates are **before** created date |
| value | |
| on_time | 1 if received on or before promised |

## How to approach it

Run the naive scorecard: on-time rate and volume by `supplier` exactly as
written. Acme's various spellings will each look like a small, mediocre vendor.

Then standardise the supplier names — strip suffixes, collapse case and
whitespace, map variants to one canonical name. Now Acme is one large vendor.
Recompute the scorecard.

Also handle the impossible `promised_date < created_date` rows before you judge
anyone on on-time performance.

Compare the before and after. The "worst supplier" verdict probably flips, or at
least the picture changes a lot.

## What to hand back

- the naive scorecard vs the one on cleaned supplier names
- how many name variants you collapsed, and the impossible-date count
- the corrected verdict: is Globex really best and Acme really worst?

## Submit

Paste your queries and both scorecards below, then send it to your PM.
