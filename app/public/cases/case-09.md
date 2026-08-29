# Case 09 — Telecom Customer Segments

**Industry:** Telecom · **Difficulty:** ANALYST

## The situation

Marketing at a mobile carrier:

> "We want to build a retention campaign around our most valuable long-tenured
> customers. Pull me a segment: high lifetime value, been with us for years,
> low churn risk. How big is it and what do they look like?"

## The data

`subscribers.csv` — one row per subscriber (~15k rows).

| column | notes |
|---|---|
| subscriber_id, plan | |
| tenure_months | **a few impossible values** (600+) |
| monthly_gb, monthly_bill, support_tickets | |
| churned | 1 if they left in the period |

## How to approach it

Sketch the "high value, long tenure" segment first, using lifetime value roughly
as `tenure_months * monthly_bill`. Note how big it comes out and its average
profile.

Then look hard at `tenure_months`. Any value over ~50 years is not a real
customer. How many rows, and how much are they inflating the segment's size and
its lifetime value? Decide what to do with them (cap, drop, flag) and redo the
segment.

Once it's clean, describe the real segment: size, plans, data usage, ticket
volume, and whether "low churn risk" actually holds for them.

## What to hand back

- the segment before and after handling the bad tenure values
- the real segment's size and profile
- whether the campaign premise (valuable + safe) is true, in one sentence

## Submit

Paste your analysis below, then send it to your PM.
