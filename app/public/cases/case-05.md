# Case 05 — Fintech Churn Analysis

**Industry:** Fintech · **Difficulty:** ANALYST

## The situation

You're the analyst at a payments app. The head of product:

> "Churn ticked up last quarter and nobody can agree on why. Sales says pricing,
> support says the app feels slow. I need a real answer before the board meeting."

## The data

Two files, meant for SQLite.

**users.csv** — `user_id, signup_date, plan, acquisition, app_version`
**transactions.csv** — `user_id, date, type, amount` (~160k rows)

There's no `churned` flag. Part of the job is defining churn from behaviour — a
user who stops transacting for long enough.

## How to approach it

1. Pin down a churn definition you can defend (e.g. no transaction for 30+ days
   after previously being active). State it.
2. Churn rate over time. Is it actually up, and by how much?
3. Now cut the churned users by every attribute you have — plan, acquisition
   channel, signup month, and `app_version`. One of these splits will be much
   sharper than the others.
4. When you find the split that matters, tighten it: *when* do those users go
   quiet relative to some event? Look at the gap between their last transaction
   and whatever changed for them.

## What to hand back

- your churn definition and the overall trend
- the single factor that explains most of the increase, with the numbers
- one sentence for the board: is this pricing, speed, or something else — and
  what's the fix

## Submit

Paste your queries and your answer below, then send it to your PM. Your PM won't
debug your SQL — they'll tell you where the argument is thin.
