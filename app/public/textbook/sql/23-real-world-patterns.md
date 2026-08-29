# Real-world query patterns (cohort, retention, funnels)

## The one-sentence version

A handful of query shapes come up again and again in analytics work, and once you can build a cohort table, a retention curve, and a funnel from memory, most product and growth questions are variations on those three.

## What it is

Three patterns, each combining things you already know (dates, joins, `CASE`, window functions) into a recognisable structure.

## Why it exists

"Are we keeping the users we acquire?" "Where do people drop off in signup?" "Is this month's cohort better than last month's?" Businesses ask these constantly. The queries are non-obvious the first time and routine after you have written them five times. Learn the skeletons.

## Pattern 1: Cohort table

Group users by when they joined (the cohort), then measure something about each cohort over the months since.

```sql
WITH cohorts AS (
  SELECT id AS user_id, date_trunc('month', created_at) AS cohort_month
  FROM users
),
activity AS (
  SELECT user_id, date_trunc('month', occurred_at) AS active_month
  FROM events
  GROUP BY 1, 2
)
SELECT
  c.cohort_month,
  EXTRACT(year FROM age(a.active_month, c.cohort_month)) * 12
    + EXTRACT(month FROM age(a.active_month, c.cohort_month)) AS months_since_join,
  COUNT(DISTINCT a.user_id) AS active_users
FROM cohorts c
JOIN activity a ON a.user_id = c.user_id
GROUP BY 1, 2
ORDER BY 1, 2;
```

Read it as: assign each user a cohort month, list the months they were active, then count active users per (cohort, months-since-join). Pivot `months_since_join` into columns in your BI tool and you have the classic triangle.

## Pattern 2: Retention curve

A cohort table collapsed to one number per period: what share of a cohort is still active N months later.

```sql
WITH cohort_size AS (
  SELECT date_trunc('month', created_at) AS cohort_month, COUNT(*) AS n
  FROM users GROUP BY 1
)
SELECT
  ct.cohort_month,
  ct.months_since_join,
  ct.active_users,
  ROUND(ct.active_users::NUMERIC / cs.n * 100, 1) AS retention_pct
FROM cohort_table ct                       -- the query from Pattern 1
JOIN cohort_size cs ON cs.cohort_month = ct.cohort_month
ORDER BY 1, 2;
```

Month 0 is 100% by definition. The shape of the decline after that is the product's retention story.

## Pattern 3: Funnel

Ordered steps, counting how many users reach each one.

```sql
WITH steps AS (
  SELECT
    user_id,
    MAX(CASE WHEN step = 'visit'    THEN 1 ELSE 0 END) AS s1_visit,
    MAX(CASE WHEN step = 'signup'   THEN 1 ELSE 0 END) AS s2_signup,
    MAX(CASE WHEN step = 'activate' THEN 1 ELSE 0 END) AS s3_activate,
    MAX(CASE WHEN step = 'purchase' THEN 1 ELSE 0 END) AS s4_purchase
  FROM funnel_events
  GROUP BY user_id
)
SELECT
  SUM(s1_visit)    AS visited,
  SUM(s2_signup)   AS signed_up,
  SUM(s3_activate) AS activated,
  SUM(s4_purchase) AS purchased
FROM steps;
```

One row per user with a 0/1 flag per step, then sum the flags. For a strict funnel (each step requires the previous), add `AND s1_visit = 1` style guards, or compare timestamps so step 3 only counts if it came after step 2.

## When you use it

Cohort and retention for any subscription, app, or marketplace question about keeping users. Funnels for any multi-step conversion: onboarding, checkout, application forms. These three plus a simple time series cover most of what a product analyst is asked for.

## A worked example

Case 15 (SaaS Cohort Retention) is Pattern 1 and 2 end to end: build the cohort table from signups and usage events, convert it to a retention curve, and the story is in which cohort the curve falls off a cliff and what shipped that month.

> **Try This**
> Case 15 for cohorts and retention. Case 12 (Onboarding Funnel) or Case 06 for the funnel pattern. Build each skeleton once without looking, then adapt.
