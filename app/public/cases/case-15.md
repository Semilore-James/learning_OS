# Case 15 — SaaS Cohort Retention

**Industry:** SaaS · **Difficulty:** SENIOR

## The situation

The CFO, prepping a fundraise:

> "Our Q2 signup cohort has terrible retention and I need to explain it to
> investors — or fix how we're measuring it. Build me a proper cohort retention
> view and tell me if Q2 is genuinely worse."

## The data

Two files for SQLite.

**accounts.csv** — `account_id, signup_date, plan, seats`
**subscription_events.csv** — `account_id, event_date, event_type` where event_type is `start`, `pause`, `resume`, or `cancel`.

## How to approach it

Build monthly cohort retention: for each signup month, the share of accounts
still active N months later. "Active" needs a definition — and this is where Q2
gets interesting.

A naive calc treats any account with no recent activity as churned. But `pause`
is not `cancel`. A chunk of the Q2 cohort are seasonal customers who pause and
resume. If you count a paused account as churned, Q2 looks like a disaster.

Redo the retention curve treating `pause` as still-a-customer (or show both
curves side by side). Then answer the CFO honestly: after separating pause from
cancel, is Q2 actually worse, or was it a measurement artefact?

## What to hand back

- a cohort retention table/heatmap
- the two versions of the Q2 curve (pause-as-churn vs pause-as-active)
- your verdict, and the retention definition you'd standardise on

## Submit

Paste your queries and the retention view below, then send it to your PM.
