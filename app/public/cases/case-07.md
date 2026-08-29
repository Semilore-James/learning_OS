# Case 07 — E-commerce Funnel Drop

**Industry:** E-commerce · **Difficulty:** ANALYST

## The situation

Growth lead, mid-month, a bit panicked:

> "Conversion on iOS has fallen through the floor since around the 10th. Finance
> says revenue looks normal though. Something doesn't add up — figure out
> what's going on before we start pausing iOS spend."

## The data

`events.csv` — the client event log. Steps in order: `view -> cart -> checkout -> payment`.

| column | notes |
|---|---|
| session_id, date, device | device is ios / android / web |
| step | one of the four |
| ts_offset_s | seconds into the session |

## How to approach it

Build the funnel per device: what share of sessions reach each step. Confirm the
iOS drop and roughly when it starts.

Then think about *where* in the funnel iOS falls off. Is it losing people at
checkout, or is the `payment` event itself just... not there? Compare the count
of `checkout` events to `payment` events for iOS before and after the drop, and
do the same for android/web as a control.

If `payment` events stopped firing on iOS but revenue is steady, the conversion
number is measuring the tracking, not the customer. Say so, and say what to
check (an SDK release, an app version) and what *not* to do (cut spend).

## What to hand back

- the funnel by device and the date the iOS drop begins
- your evidence that this is a tracking gap, not a real conversion drop
- the recommendation to the growth lead in one sentence

## Submit

Paste your analysis below, then send it to your PM.
