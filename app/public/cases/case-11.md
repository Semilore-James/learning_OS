# Case 11 — HR Attrition Analysis

**Industry:** Corporate · **Difficulty:** ANALYST

## The situation

The People team:

> "We lost more people than usual this year and the exec team thinks it's pay.
> HR thinks it's managers. We're about to spend a lot on either salary bands or
> manager training. Which is it — and where?"

## The data

Two files.

**employees.csv** — `employee_id, department, hire_date, level, last_promo_date, salary, status`
**exits.csv** — `employee_id, exit_date, exit_reason` — reason is **free text** ("pay", "comp", "better offer $$$", "manager", "burnout", …)

## How to approach it

First, attrition rate overall and by department. One department will stand out.

Then bucket the free-text exit reasons into a few clean categories (pay,
management, role, life, other). Do it by hand or with keyword rules — just be
consistent and show your mapping.

Now cross department against tenure and promotion history. Look specifically at
people who left: how long had they been there, and had they ever been promoted?
There's a group with a shared profile — a specific department, a specific tenure
band, no promotion. Their exit reasons will point somewhere.

## What to hand back

- attrition by department
- your exit-reason categories and the mapping you used
- the profile of the group driving the excess attrition, and whether the fix is
  pay, career path, or management — with the numbers

## Submit

Paste your findings below, then send it to your PM.
