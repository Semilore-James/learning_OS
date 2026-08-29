# Case 08 — Hospital Readmission Patterns

**Industry:** Healthcare · **Difficulty:** ANALYST

## The situation

A hospital quality team:

> "Our 30-day readmission rate is above target and the Cardiology unit looks
> like the worst offender. Before we put Cardiology on an improvement plan, I
> want an independent read. Is it really the unit?"

## The data

`admissions.csv` — one row per admission (~12k rows).

| column | notes |
|---|---|
| admission_id, unit, admit_date, discharge_date | |
| discharge_time | **blank for weekend discharges** |
| age | |
| readmit_30d | 1 if readmitted within 30 days |

## How to approach it

Start with readmission rate by unit. Cardiology probably does look high.

Then don't stop there. Length of stay is a common confounder — but notice
`discharge_time` is missing for weekend discharges. If you compute length of stay
naively, a blank time may collapse to same-day, understating stay. Check whether
the missingness itself lines up with readmissions.

Look at readmission by day-of-week of discharge, and by age band, holding the
unit aside. You may find the pattern is really about *when* people are
discharged (and who), not *which unit* discharged them. Cardiology might just
discharge more people on weekends.

## What to hand back

- readmission rate by unit (the naive view)
- what the `discharge_time` gap does to a length-of-stay calc
- readmission by discharge day-of-week and age — and your call on whether
  Cardiology is the real driver

## Submit

Paste your analysis below, then send it to your PM.
