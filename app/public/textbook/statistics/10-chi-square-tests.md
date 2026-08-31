# Chi-square tests

## The one-sentence version

Chi-square is the t-test's counterpart for categories: it tells you whether the counts in a contingency table are more lopsided than chance would produce.

## What it is

Two related tests, both working on counts of categorical data:

- **Chi-square test of independence** — given a cross-tab of two categorical variables, are they related? "Does device type (mobile / desktop) relate to whether the user converts (yes / no)?"
- **Chi-square goodness of fit** — does one categorical variable's distribution match an expected one? "Are orders spread evenly across the seven days, or is the weekend different?"

Both compare **observed counts** to the **expected counts** you would see if there were no relationship, and sum up the squared, scaled differences into one statistic.

## Why it exists

You often want to compare rates across several groups at once, or test a whole distribution, not just two means. Mobile vs desktop vs tablet conversion, ticket volume by channel by priority, whether a fraud flag clusters in certain merchant categories. Chi-square handles the whole table in one test, and it works on the raw counts, which is exactly what a `groupby().size()` or a pivot gives you.

## How it works

**Build the contingency table** (a pivot of counts). For each cell, the **expected count** under independence is `(row total x column total) / grand total`. The statistic is:

```
chi-square = sum over cells of  (observed - expected)^2 / expected
```

Bigger means the observed table is further from what "no relationship" predicts. The p-value depends on the statistic and the **degrees of freedom** (`(rows - 1) x (columns - 1)` for a two-way table).

**Assumptions:**

- **Counts, not percentages or means.** Feed it the raw frequencies. A common error is running it on rates.
- **Expected count of at least 5 in most cells** (a rough rule). If you have tiny categories, combine them or use Fisher's exact test.
- **Independent observations.** One row per unit, each unit counted once.

**Chi-square tells you there is a relationship, not where or how strong.** A significant result on a 4x3 table means something in the table is not independent, but you then have to look at which cells have the biggest `(observed - expected)` to see what is driving it. For strength, use Cramer's V (a 0-to-1 measure) alongside the p-value.

**Large samples make everything significant.** With 500,000 rows, a conversion difference of 3.00% vs 3.05% across devices will be "significant". Look at the actual rates and the effect size, not just the p-value.

## When you use it

Comparing a rate or a proportion across two or more categories, or checking whether a categorical distribution matches an expectation. If you only have two groups and two outcomes, a two-proportion z-test gives the same answer and a direction; chi-square generalises to more.

## A worked example

Conversion by traffic source:

| Source | Converted | Did not | Conv. rate |
|---|---|---|---|
| Organic | 320 | 6,680 | 4.6% |
| Paid | 210 | 3,290 | 6.0% |
| Referral | 95 | 1,405 | 6.3% |
| Social | 40 | 2,960 | 1.3% |

Chi-square test of independence: chi-square = 118, df = 3, p < 0.001. Cramer's V = 0.09.

The p-value says traffic source and conversion are related (not surprising with 25,000 rows). Cramer's V of 0.09 says the relationship is weak-to-moderate. The story is in the cells: social converts at a third of the rate of everything else, and that single row contributes most of the statistic.

The recommendation is not "source matters, p < 0.001". It is "social traffic converts at 1.3% against a 5% baseline; either the targeting or the landing experience for social is broken, and it is dragging blended conversion down".

> **Try This**
> Take two categorical columns from a case (segment and outcome, region and status) and build the cross-tab of counts. Compute the expected count for one cell by hand `(row total x col total / grand total)` and compare it to the observed. If they are far apart, that cell is part of your finding.
