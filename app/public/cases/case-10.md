# Case 10 — Real Estate Price Trends

**Industry:** Real Estate · **Difficulty:** ANALYST

## The situation

A property portal's editorial team wants a piece:

> "Our data shows average home prices *fell* last year. That's a big story if
> it's true. Can you confirm it and give us a clean chart of price per square
> metre over time?"

## The data

`listings.csv` — one row per listing (~9k rows).

| column | notes |
|---|---|
| listing_id, city | |
| listed_date, sold_date | some sold dates are **before** the listed date |
| bedrooms, area | area is in square metres — **but not always** |
| price | a few extreme outliers |

## How to approach it

Compute price per square metre and plot it over time — the naive version. It may
well trend down.

Then be suspicious. Two things to check:

- `area`: bedrooms give you a rough sanity range for size. Some rows have area
  roughly 10x too big — a square-feet value left unlabelled in a square-metre
  column. Those crush the price-per-area figure.
- `price`: a handful of listings are 10x or 0.1x their neighbours. Outliers.
- dates: sold before listed means the record is unreliable.

Clean those, redo the chart, and see whether the "prices fell" story survives.

## What to hand back

- the three data problems, with counts and how you handled each
- price per square metre over time, before and after
- one sentence for the editorial team: does the headline hold?

## Submit

Paste your analysis below, then send it to your PM.
