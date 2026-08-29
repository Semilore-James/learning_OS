# Case 12 — EdTech Completion Rate Drop

**Industry:** EdTech · **Difficulty:** ANALYST

## The situation

Head of curriculum:

> "Course completion dropped noticeably in Q3 and it's hurting our renewal
> numbers. The content team says nothing changed. I need to know where students
> are dropping off and I need it as one slide for the leadership meeting Friday."

## The data

Two files for SQLite.

**enrolments.csv** — `enrolment_id, course, enrolled_date, plan`
**lesson_progress.csv** — `enrolment_id, lesson_no, completed, completed_date` (~100k rows). A student stops appearing once they hit a lesson they don't complete.

## How to approach it

Overall completion rate by enrolment month — confirm the Q3 drop.

Then find *where* students stop. For each lesson number, what fraction of
students who reached it completed it? Do this for pre-Q3 and Q3 enrolments
separately. One lesson's completion rate collapses between the two periods —
and because students stop at the first incomplete lesson, everything after it
drops too.

Pin down the date the collapse starts. That date is your story: something
changed for that lesson, whatever the content team remembers.

## What to hand back

- completion rate over time (the trend)
- per-lesson completion, before vs during Q3 — the one lesson that broke
- the date it starts, and a one-line recommendation
- describe the single slide you'd show leadership

## Submit

Paste your findings and your slide description below, then send it to your PM.
