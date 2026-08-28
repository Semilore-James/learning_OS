# The shape of a question

## The one-sentence version

Most analytics questions are one of a small number of shapes, and learning to recognise the shape tells you which tool to pick up.

## The shapes

**How many / how much.** A single number. "How many active users last month?" "What was total revenue?" This is `COUNT` or `SUM` with a `WHERE`.

**Per each.** A number for every category. "Revenue per region." "Tickets per agent." This is `GROUP BY`.

**Over time.** A number for every time bucket, so you can see a trend. "Sign-ups per week for the last quarter." This is `GROUP BY` on a truncated date.

**Compared to.** Two numbers side by side, or a ratio. "This month versus last month." "Conversion rate for group A versus group B." This is aggregation plus a division, sometimes a `JOIN` of a period to itself.

**Which ones.** A list of specific rows that meet a condition. "Which accounts have not logged in for 30 days?" This is `SELECT` with a careful `WHERE`.

**Ranked.** The top or bottom of something. "Our five worst-performing stores." This is `ORDER BY` and `LIMIT`, usually after a `GROUP BY`.

**Is this real.** "The drop looks big, but is it outside normal variation?" This is where statistics enters: a confidence interval, a test, or at least a check of the sample size.

## Why naming the shape helps

When a request comes in fuzzy, restating it as a shape forces the missing details into the open.

"Churn feels high" has no shape yet. Push it toward one:

- "How much" churn? Over what window? (a rate)
- Churn "per each" plan tier? (a group-by)
- Churn "over time", monthly? (a trend)
- "Compared to" last year? (a comparison)

Each version is a different query and a different chart. You cannot start until you know which one they actually want, and often they do not know until you offer the choices.

## The move

Before writing any SQL, write the question as a sentence with a shape word in it. "This is a *per-each* question: sign-ups grouped by acquisition channel, for Q1." Now the query almost writes itself, and if the stakeholder wanted something else, you find out before you have wasted an afternoon.
