# Case 01 — Retail Sales Audit

**Industry:** Retail · **Difficulty:** ROOKIE

## The situation

A small chain of six garden centres has sent you a year of till data — one file,
`transactions.csv`, about 4,600 rows. The operations manager's message is short:

> "Something doesn't line up between our reports and what the stores tell me on
> the phone. Have a look and tell me what you find."

That's the whole brief. There is no single question to answer yet. Finding the
questions worth asking is part of the work.

## The data

`transactions.csv` — one row per sale.

| column | example | notes |
|---|---|---|
| date | 2024-06-03 | |
| store | Ikeja | one of six shops |
| category | Plants | Plants, Tools, Soil, Pots, Furniture, Other |
| units | 3 | how many sold |
| unit_price | 4500 | Naira; **sometimes blank** |
| discount_pct | 0.1 | a fraction from 0 to 1 |
| payment_method | card | card, cash, transfer |

It is *lightly* dirty. Expect a few blank prices, a handful of store names typed
wrong, and some rows where `units` is 0. Cleaning that is the easy part — and it
is also where the interesting thread starts to show.

## How to approach it

Start by getting the data into a state you trust: decide what to do with the
blanks, the misspellings, the zero-unit rows, and write down each decision as you
go. Keep a rough count of what you removed or corrected.

Then look at the money. Net revenue (after discount) by store, by category, by
month, by payment method — whichever cuts help you see the shape of the business.

Somewhere in there, one store behaves differently from the other five. When you
notice it, follow it: slice it by payment method, by discount, by time of day if
you can infer it. Ask yourself what an honest explanation would look like, and
whether the numbers support it.

There may be more than one thing worth reporting. A data-quality problem is a
finding. An odd pattern at one store is a finding. Don't stop at the first one.

## What to hand back

A short write-up for the operations manager:

- what you did to the data and why (a few lines)
- two or three things that stand out, each backed by a number
- for the one that matters most, what you think is going on and what you'd
  check next

The findings are the deliverable. The pivot tables are just how you got there.

## Submit

Paste your cleaning notes and your findings below, then send it to your PM.
