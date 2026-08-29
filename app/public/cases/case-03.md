# Case 03 — Restaurant Revenue by Location

**Industry:** Hospitality · **Difficulty:** ROOKIE

## The situation

A four-branch restaurant group hands you a year of till tickets:

> "Riverside is our best branch on paper but the owner there keeps asking for
> more staff budget and I can't see why the numbers support it. Give me revenue
> by branch and anything else that jumps out."

## The data

`tickets.csv` — one row per table.

| column | notes |
|---|---|
| ticket_id, date, location | location is **blank on a few rows** |
| covers | number of diners |
| food, drink | spend before tip |
| tip | **occasionally negative** (voids) |
| payment | card or cash |

## How to approach it

Get the data into shape first — decide what to do with the blank locations and
the negative tips, and note it.

Then revenue by branch (food + drink, tips are not revenue). Then per cover, per
day of week.

When you look at Riverside, check the tips separately. Tip as a percentage of
the bill, by branch, by payment method. One branch will look different from the
other three. Think about what an honest explanation is, and whether it changes
how you'd read that branch's "performance".

## What to hand back

- revenue by branch, and revenue per cover
- your cleaning notes (blanks, negative tips)
- the one thing about Riverside that stands out, with the number, and what
  you'd check next

## Submit

Paste your findings below and send it to your PM.
