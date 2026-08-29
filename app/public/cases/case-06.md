# Case 06 — Logistics Route Efficiency

**Industry:** Logistics · **Difficulty:** ANALYST

## The situation

A parcel carrier runs four depots. Ops director:

> "The South depot's dashboard shows the fastest average delivery time by a
> mile. I want to roll their process out everywhere. Confirm the number and
> tell me what they're doing right."

## The data

`deliveries.csv` — `delivery_id, depot, driver_id, dispatch_ts, arrival_ts, distance_km, parcels` (~14k rows).

Delivery time is `arrival_ts - dispatch_ts`.

## How to approach it

Before you compute anything, check the raw timestamps. Are there deliveries
where arrival is *before* dispatch? How many, and are they spread across depots
or concentrated? Also check `delivery_id` — is it actually unique?

Once you've decided how to handle the bad rows, recompute average delivery time
per depot on the clean data. Does the South depot still lead? By how much now?

If the "South is fastest" claim was an artefact, say what caused it and where
the real efficiency differences (if any) are — distance per parcel, parcels per
run, time of day.

## What to hand back

- what's wrong with the raw data (bad timestamps, duplicate IDs), with counts
- average delivery time by depot, before and after cleaning
- one sentence: is the South process worth copying?

## Submit

Paste your queries and conclusion, then send it to your PM.
