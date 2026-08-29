# Case 13 — Ride-hailing Driver Efficiency

**Industry:** Mobility · **Difficulty:** ANALYST

## The situation

Driver ops:

> "We want to give our top 20 drivers a loyalty bonus based on this quarter's
> trips. Marketing already drafted the leaderboard by total fares. Sanity-check
> it before we send money."

## The data

`trips.csv` — one row per trip (~30k rows).

| column | notes |
|---|---|
| trip_id, driver_id | |
| start_ts, end_ts | |
| distance_km | **a few trips are 0 km with a non-zero fare** |
| fare, rating | |

## How to approach it

Build the leaderboard the way marketing did — total fares per driver — and note
who's on it.

Then look at the trips behind the top names. Some drivers have an unusual number
of `distance_km = 0` trips that still charged a fare. That's either a lot of
instant cancellations-with-charge or a meter exploit. Either way it's not
efficient driving.

Rank drivers on something harder to game: fare per hour on the road, or fare per
km, using only trips with a real distance. See which names from the original top
20 survive and which drop.

This is a good place for a window function — `RANK()` or `ROW_NUMBER()` over
drivers by your chosen metric.

## What to hand back

- the naive leaderboard vs your cleaned one
- the drivers whose numbers don't hold up, and why
- who should actually get the bonus

## Submit

Paste your queries and the two leaderboards below, then send it to your PM.
